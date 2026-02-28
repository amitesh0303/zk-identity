"use client";

import type { VerificationResult as VR } from "@/types";
import clsx from "clsx";

interface VerificationResultProps {
  result: VR;
}

export function VerificationResult({ result }: VerificationResultProps) {
  return (
    <div
      className={clsx(
        "glass rounded-2xl p-6 border",
        result.valid
          ? "border-green-500/40"
          : "border-red-500/40"
      )}
    >
      <div className="flex items-center gap-4 mb-4">
        <span className="text-5xl">{result.valid ? "✅" : "❌"}</span>
        <div>
          <h3 className={clsx("text-2xl font-bold", result.valid ? "text-green-400" : "text-red-400")}>
            {result.valid ? "Proof Valid" : "Proof Invalid"}
          </h3>
          <p className="text-sm text-slate-400">
            Verified at {new Date(result.verifiedAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-slate-400">
        <div className="flex justify-between">
          <span>Verification ID</span>
          <span className="font-mono text-slate-300">{result.verificationId}</span>
        </div>
        <div className="flex justify-between">
          <span>Status</span>
          <span className={result.valid ? "text-green-400" : "text-red-400"}>
            {result.valid ? "VERIFIED" : "REJECTED"}
          </span>
        </div>
      </div>

      {result.valid && (
        <p className="mt-4 text-xs text-slate-500">
          This proof has been recorded on-chain. The verifying dApp can trust this result.
        </p>
      )}
    </div>
  );
}
