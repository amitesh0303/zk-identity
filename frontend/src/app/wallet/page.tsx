"use client";

import { WalletConnect } from "@/components/WalletConnect";
import { useWallet } from "@/hooks/useWallet";
import { CredentialCard } from "@/components/CredentialCard";
import type { Credential } from "@/types";

// Demo credentials – in production these come from the API filtered by public key
const DEMO_CREDENTIALS: Credential[] = [
  {
    id: "demo-age-001",
    holderPublicKey: "",
    credentialType: "age_verification",
    commitment: "a1b2c3d4e5f6".padEnd(64, "0"),
    issuedAt: new Date(Date.now() - 30 * 86400_000).toISOString(),
    expiresAt: new Date(Date.now() + 335 * 86400_000).toISOString(),
    revoked: false,
  },
  {
    id: "demo-citizenship-001",
    holderPublicKey: "",
    credentialType: "citizenship",
    commitment: "b2c3d4e5f6a1".padEnd(64, "0"),
    issuedAt: new Date(Date.now() - 60 * 86400_000).toISOString(),
    expiresAt: new Date(Date.now() + 305 * 86400_000).toISOString(),
    revoked: false,
  },
];

export default function WalletPage() {
  const { connected, publicKey, connect, disconnect } = useWallet();

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Your Wallet</h1>
        <p className="text-slate-400 mb-10">
          Connect your Solana wallet to view and manage your credentials.
        </p>

        <WalletConnect
          connected={connected}
          publicKey={publicKey}
          onConnect={connect}
          onDisconnect={disconnect}
        />

        {connected && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-6">Your Credentials</h2>
            {DEMO_CREDENTIALS.length === 0 ? (
              <p className="text-slate-400">No credentials found for this wallet.</p>
            ) : (
              <div className="grid gap-4">
                {DEMO_CREDENTIALS.map((c) => (
                  <CredentialCard key={c.id} credential={c} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
