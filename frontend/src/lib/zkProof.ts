import type { ZKProof, CredentialType } from "../types";

// snarkjs is a CommonJS module; use dynamic require for browser compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const require: (mod: string) => any;

export interface ProofArtifacts {
  proof: ZKProof;
  publicSignals: string[];
}

/**
 * Returns the paths to the circuit's .wasm and .zkey files.
 */
function getCircuitPaths(circuitType: CredentialType): {
  wasmPath: string;
  zkeyPath: string;
} {
  const base = `/circuits/${circuitType}`;
  return {
    wasmPath: `${base}.wasm`,
    zkeyPath: `${base}_final.zkey`,
  };
}

/**
 * Generates a Groth16 ZK proof for the given circuit and inputs.
 *
 * @param circuitType - The circuit to use (age_verification | citizenship | income)
 * @param inputs      - Combined private + public witness inputs
 */
export async function generateProof(
  circuitType: CredentialType,
  inputs: Record<string, string | number | bigint>
): Promise<ProofArtifacts> {
  // Dynamic import keeps snarkjs out of the server bundle
  const snarkjs = await import("snarkjs");
  const { wasmPath, zkeyPath } = getCircuitPaths(circuitType);

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    inputs,
    wasmPath,
    zkeyPath
  );

  return {
    proof: proof as ZKProof,
    publicSignals: publicSignals as string[],
  };
}

/**
 * Verifies a Groth16 proof in the browser using the circuit's verification key.
 */
export async function verifyProofLocally(
  circuitType: CredentialType,
  proof: ZKProof,
  publicSignals: string[]
): Promise<boolean> {
  const snarkjs = await import("snarkjs");
  const vkeyUrl = `/circuits/${circuitType}_verification_key.json`;
  const response = await fetch(vkeyUrl);
  if (!response.ok) {
    throw new Error(`Failed to load verification key for ${circuitType}`);
  }
  const vkey = await response.json();
  return snarkjs.groth16.verify(vkey, publicSignals, proof);
}

/**
 * Encodes a commitment (Poseidon hash output as decimal string) to a
 * hex string suitable for the backend API.
 */
export function commitmentToHex(commitmentDecimal: string): string {
  return BigInt(commitmentDecimal).toString(16).padStart(64, "0");
}

/**
 * Builds the age-verification witness from human-readable inputs.
 */
export function buildAgeInputs(params: {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  salt: bigint;
  minAge: number;
}): Record<string, number | string> {
  const now = new Date();
  return {
    birthYear: params.birthYear,
    birthMonth: params.birthMonth,
    birthDay: params.birthDay,
    salt: params.salt.toString(),
    currentYear: now.getFullYear(),
    currentMonth: now.getMonth() + 1,
    currentDay: now.getDate(),
    minAge: params.minAge,
  };
}

/**
 * Builds the income-verification witness.
 */
export function buildIncomeInputs(params: {
  annualIncomeCents: bigint;
  thresholdCents: bigint;
  salt: bigint;
}): Record<string, string> {
  return {
    annualIncome: params.annualIncomeCents.toString(),
    salt: params.salt.toString(),
    threshold: params.thresholdCents.toString(),
  };
}

/**
 * Builds the citizenship-verification witness.
 */
export function buildCitizenshipInputs(params: {
  countryCode: number;
  documentNumber: bigint;
  salt: bigint;
  targetCountryCode: number;
}): Record<string, string | number> {
  return {
    countryCode: params.countryCode,
    documentNumber: params.documentNumber.toString(),
    salt: params.salt.toString(),
    targetCountryCode: params.targetCountryCode,
  };
}
