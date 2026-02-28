export interface ZKProof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol: "groth16";
  curve: "bn128";
}

export interface Credential {
  id: string;
  holderPublicKey: string;
  credentialType: CredentialType;
  commitment: string;
  issuedAt: string;
  expiresAt: string;
  revoked: boolean;
}

export type CredentialType = "age_verification" | "citizenship" | "income";

export interface VerificationResult {
  verificationId: string;
  valid: boolean;
  verifiedAt: string;
}

export interface ProofGenerationInput {
  circuitType: CredentialType;
  privateInputs: Record<string, string | number>;
  publicInputs: Record<string, string | number>;
}

export interface WalletState {
  connected: boolean;
  publicKey: string | null;
  connecting: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface VerifyRequest {
  credentialId: string;
  circuitType: CredentialType;
  proof: ZKProof;
  publicSignals: string[];
  verifierPublicKey: string;
}

export interface IssueCredentialRequest {
  holderPublicKey: string;
  credentialType: CredentialType;
  commitment: string;
  expiresAt: number;
  issuerSignature: string;
}
