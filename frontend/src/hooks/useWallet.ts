"use client";

import { useState, useEffect, useCallback } from "react";
import type { WalletState } from "../types";

// Lightweight wallet abstraction that works with the Solana wallet adapter
// without forcing a hard dependency on the adapter in the hook itself.
export function useWallet(): WalletState & {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array | null>;
} {
  const [state, setState] = useState<WalletState>({
    connected: false,
    publicKey: null,
    connecting: false,
  });

  // Detect if Phantom / any Solana wallet is available
  const getProvider = useCallback(() => {
    if (typeof window === "undefined") return null;
    interface SolanaProvider {
      isConnected?: boolean;
      publicKey?: { toString(): string };
      connect(): Promise<void>;
      disconnect(): Promise<void>;
      signMessage(
        msg: Uint8Array,
        encoding: string
      ): Promise<{ signature: Uint8Array }>;
      on(event: string, handler: () => void): void;
      off(event: string, handler: () => void): void;
    }
    interface WindowWithSolana extends Window {
      solana?: SolanaProvider;
      phantom?: { solana?: SolanaProvider };
    }
    const win = window as WindowWithSolana;
    return win.solana ?? win.phantom?.solana ?? null;
  }, []);

  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;

    // Auto-connect if previously authorised
    if (provider.isConnected && provider.publicKey) {
      setState({
        connected: true,
        publicKey: provider.publicKey.toString(),
        connecting: false,
      });
    }

    const onConnect = () => {
      setState({
        connected: true,
        publicKey: provider.publicKey?.toString() ?? null,
        connecting: false,
      });
    };

    const onDisconnect = () => {
      setState({ connected: false, publicKey: null, connecting: false });
    };

    provider.on("connect", onConnect);
    provider.on("disconnect", onDisconnect);

    return () => {
      provider.off("connect", onConnect);
      provider.off("disconnect", onDisconnect);
    };
  }, [getProvider]);

  const connect = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      window.open("https://phantom.app/", "_blank");
      return;
    }
    setState((s) => ({ ...s, connecting: true }));
    try {
      await provider.connect();
    } catch {
      setState((s) => ({ ...s, connecting: false }));
    }
  }, [getProvider]);

  const disconnect = useCallback(async () => {
    const provider = getProvider();
    if (provider) await provider.disconnect();
    setState({ connected: false, publicKey: null, connecting: false });
  }, [getProvider]);

  const signMessage = useCallback(
    async (message: Uint8Array): Promise<Uint8Array | null> => {
      const provider = getProvider();
      if (!provider || !state.connected) return null;
      try {
        const { signature } = await provider.signMessage(message, "utf8");
        return signature as Uint8Array;
      } catch {
        return null;
      }
    },
    [getProvider, state.connected]
  );

  return { ...state, connect, disconnect, signMessage };
}
