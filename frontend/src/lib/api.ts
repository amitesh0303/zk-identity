import axios from "axios";
import type {
  Credential,
  VerificationResult,
  VerifyRequest,
  IssueCredentialRequest,
} from "../types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

export async function issueCredential(
  data: IssueCredentialRequest
): Promise<Credential> {
  const res = await api.post<{ success: boolean; credential: Credential }>(
    "/credentials/issue",
    data
  );
  return res.data.credential;
}

export async function revokeCredential(
  credentialId: string,
  issuerSignature: string
): Promise<void> {
  await api.post("/credentials/revoke", { credentialId, issuerSignature });
}

export async function getCredential(id: string): Promise<Credential> {
  const res = await api.get<{ success: boolean; credential: Credential }>(
    `/credentials/${id}`
  );
  return res.data.credential;
}

export async function verifyProof(
  data: VerifyRequest
): Promise<VerificationResult> {
  const res = await api.post<VerificationResult & { success: boolean }>(
    "/verify",
    data
  );
  return {
    verificationId: res.data.verificationId,
    valid: res.data.valid,
    verifiedAt: res.data.verifiedAt,
  };
}

export async function getVerificationStatus(
  verificationId: string
): Promise<{ valid: boolean; verifiedAt: string } | null> {
  const res = await api.get<{
    success: boolean;
    status: { valid: boolean; verifiedAt: string };
  }>(`/verify/status/${verificationId}`);
  return res.data.status ?? null;
}

export default api;
