"use client";

import type { Credential, CredentialType } from "@/types";
import clsx from "clsx";

interface CredentialCardProps {
  credential: Credential;
  onRevoke?: (id: string) => void;
}

const CREDENTIAL_META: Record<
  CredentialType,
  { icon: string; label: string; color: string }
> = {
  age_verification: { icon: "🎂", label: "Age Verification", color: "brand" },
  citizenship: { icon: "🌍", label: "Citizenship", color: "purple" },
  income: { icon: "💰", label: "Income Verification", color: "green" },
};

export function CredentialCard({ credential, onRevoke }: CredentialCardProps) {
  const meta = CREDENTIAL_META[credential.credentialType];
  const expiresAt = new Date(credential.expiresAt);
  const isExpired = expiresAt < new Date();

  return (
    <div
      className={clsx(
        "glass rounded-2xl p-5 flex items-start justify-between gap-4",
        credential.revoked && "opacity-50"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl mt-1">{meta.icon}</div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">{meta.label}</h3>
            {credential.revoked ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                Revoked
              </span>
            ) : isExpired ? (
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                Expired
              </span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-mono mb-1">
            ID: {credential.id}
          </p>
          <p className="text-xs text-slate-500">
            Issued: {new Date(credential.issuedAt).toLocaleDateString()} &nbsp;·&nbsp;
            Expires: {expiresAt.toLocaleDateString()}
          </p>
        </div>
      </div>

      {!credential.revoked && onRevoke && (
        <button
          onClick={() => onRevoke(credential.id)}
          className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors whitespace-nowrap"
        >
          Revoke
        </button>
      )}
    </div>
  );
}
