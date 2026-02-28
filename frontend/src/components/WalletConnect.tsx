"use client";

import clsx from "clsx";

interface WalletConnectProps {
  connected: boolean;
  publicKey: string | null;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  connecting?: boolean;
}

export function WalletConnect({
  connected,
  publicKey,
  onConnect,
  onDisconnect,
  connecting = false,
}: WalletConnectProps) {
  const shortKey = publicKey
    ? `${publicKey.slice(0, 4)}…${publicKey.slice(-4)}`
    : null;

  return (
    <div className="flex items-center gap-3">
      <div
        className={clsx(
          "w-2 h-2 rounded-full",
          connected ? "bg-green-400" : "bg-slate-500"
        )}
      />

      {connected ? (
        <div className="flex items-center gap-3">
          <span className="text-sm font-mono text-slate-300 glass px-3 py-1.5 rounded-lg">
            {shortKey}
          </span>
          <button
            onClick={onDisconnect}
            className="text-sm px-4 py-2 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={onConnect}
          disabled={connecting}
          className="text-sm px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 font-semibold transition-colors"
        >
          {connecting ? "Connecting…" : "Connect Wallet"}
        </button>
      )}
    </div>
  );
}
