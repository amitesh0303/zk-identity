"use client";

import { ProofGenerator } from "@/components/ProofGenerator";
import { useWallet } from "@/hooks/useWallet";
import { WalletConnect } from "@/components/WalletConnect";

export default function ProofPage() {
  const { connected, publicKey, connect, disconnect } = useWallet();

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Generate a ZK Proof</h1>
        <p className="text-slate-400 mb-10">
          Prove an identity attribute without revealing your personal data.
          All computation happens locally in your browser.
        </p>

        {!connected ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-slate-300 mb-6">
              Connect your wallet to generate a proof.
            </p>
            <WalletConnect
              connected={false}
              publicKey={null}
              onConnect={connect}
              onDisconnect={disconnect}
            />
          </div>
        ) : (
          <ProofGenerator walletPublicKey={publicKey!} />
        )}
      </div>
    </div>
  );
}
