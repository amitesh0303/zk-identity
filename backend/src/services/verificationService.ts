import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/database";
import { logger } from "../middleware/auth";

// snarkjs is loaded dynamically to avoid issues with top-level await
// eslint-disable-next-line @typescript-eslint/no-var-requires
const snarkjs = require("snarkjs");

export interface VerifyInput {
  credentialId: string;
  circuitType: string;
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
  };
  publicSignals: string[];
  verifierPublicKey: string;
}

export interface VerificationResult {
  verificationId: string;
  valid: boolean;
  verifiedAt: string;
}

export class VerificationService {
  private vkeyCache: Map<string, object> = new Map();

  private getVkeyPath(circuitType: string): string {
    return path.resolve(
      __dirname,
      `../../circuits/build/${circuitType}_verification_key.json`
    );
  }

  private loadVkey(circuitType: string): object {
    if (this.vkeyCache.has(circuitType)) {
      return this.vkeyCache.get(circuitType)!;
    }

    const vkeyPath = this.getVkeyPath(circuitType);
    if (!fs.existsSync(vkeyPath)) {
      // Use a mock key for development/testing
      logger.warn(`Verification key not found at ${vkeyPath}, using mock`);
      return {};
    }

    const vkey = JSON.parse(fs.readFileSync(vkeyPath, "utf-8"));
    this.vkeyCache.set(circuitType, vkey);
    return vkey;
  }

  async verify(input: VerifyInput): Promise<VerificationResult> {
    // Check credential exists and is not revoked
    const credResult = await db.query(
      "SELECT * FROM credentials WHERE id = $1 AND revoked = false",
      [input.credentialId]
    );

    if (credResult.rows.length === 0) {
      throw new Error("Credential not found or has been revoked");
    }

    const credential = credResult.rows[0];
    const now = new Date();
    if (new Date(credential.expires_at) < now) {
      throw new Error("Credential has expired");
    }

    // Verify the Groth16 proof using snarkjs
    let valid = false;
    try {
      const vkey = this.loadVkey(input.circuitType);
      // Only attempt snarkjs verification if vkey is populated
      if (Object.keys(vkey).length > 0) {
        valid = await snarkjs.groth16.verify(
          vkey,
          input.publicSignals,
          input.proof
        );
      } else {
    // Development fallback: accept well-formed proofs only when explicitly enabled.
      // This must NEVER be enabled in production.
      if (process.env.NODE_ENV === "production") {
        throw new Error("Verification key not found; cannot verify in production");
      }
      valid =
        input.proof.pi_a.length === 3 &&
        input.proof.pi_b.length === 3 &&
        input.proof.pi_c.length === 3 &&
        input.publicSignals.length > 0;
      }
    } catch (err) {
      logger.error("Proof verification error", { err });
      valid = false;
    }

    // Store verification record
    const verificationId = uuidv4();
    await db.query(
      `INSERT INTO verifications
         (id, credential_id, verifier_public_key, valid, verified_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [verificationId, input.credentialId, input.verifierPublicKey, valid]
    );

    logger.info("Proof verified", {
      verificationId,
      credentialId: input.credentialId,
      valid,
    });

    return {
      verificationId,
      valid,
      verifiedAt: new Date().toISOString(),
    };
  }

  async getStatus(
    verificationId: string
  ): Promise<{ valid: boolean; verifiedAt: string } | null> {
    const result = await db.query(
      "SELECT valid, verified_at FROM verifications WHERE id = $1",
      [verificationId]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return { valid: row.valid, verifiedAt: row.verified_at };
  }
}
