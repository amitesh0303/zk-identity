import { v4 as uuidv4 } from "uuid";
import { db } from "../db/database";
import { logger } from "../middleware/auth";

export interface IssueCredentialInput {
  holderPublicKey: string;
  credentialType: string;
  commitment: string;
  expiresAt: number;
  issuerSignature: string;
}

export interface Credential {
  id: string;
  holder_public_key: string;
  credential_type: string;
  commitment: string;
  issued_at: Date;
  expires_at: Date;
  revoked: boolean;
  issuer_signature: string;
}

export class CredentialService {
  async issue(input: IssueCredentialInput): Promise<Credential> {
    const id = uuidv4();

    // Check for duplicate commitment
    const existing = await db.query(
      "SELECT id FROM credentials WHERE commitment = $1",
      [input.commitment]
    );
    if (existing.rows.length > 0) {
      throw new Error("Credential with this commitment already exists");
    }

    const result = await db.query<Credential>(
      `INSERT INTO credentials
         (id, holder_public_key, credential_type, commitment, expires_at, issuer_signature)
       VALUES ($1, $2, $3, $4, to_timestamp($5), $6)
       RETURNING *`,
      [
        id,
        input.holderPublicKey,
        input.credentialType,
        input.commitment,
        input.expiresAt,
        input.issuerSignature,
      ]
    );

    logger.info("Credential issued", { id, credentialType: input.credentialType });
    return result.rows[0];
  }

  async revoke(credentialId: string, issuerSignature: string): Promise<void> {
    const result = await db.query(
      "UPDATE credentials SET revoked = true WHERE id = $1 AND issuer_signature = $2",
      [credentialId, issuerSignature]
    );

    if (result.rowCount === 0) {
      throw new Error("Credential not found or signature mismatch");
    }

    logger.info("Credential revoked", { credentialId });
  }

  async getById(id: string): Promise<Credential | null> {
    const result = await db.query<Credential>(
      "SELECT * FROM credentials WHERE id = $1",
      [id]
    );
    return result.rows[0] ?? null;
  }

  async getByHolder(holderPublicKey: string): Promise<Credential[]> {
    const result = await db.query<Credential>(
      "SELECT * FROM credentials WHERE holder_public_key = $1 ORDER BY issued_at DESC",
      [holderPublicKey]
    );
    return result.rows;
  }
}
