"use client";
import React, { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { DEFAULT_PROVIDER_URL } from "../lib/anchor";
import "@solana/wallet-adapter-react-ui/styles.css";

export default function Wallet({ children }: { children: React.ReactNode }) {
  const [error, setError] = React.useState<string | null>(null);
  const [hasPhantom, setHasPhantom] = React.useState<boolean | null>(null);
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = DEFAULT_PROVIDER_URL;

  // Defer wallet adapter initialization until we've detected the environment on client
  const wallets = useMemo(() => {
    if (typeof window === 'undefined') return [];
    // @ts-ignore
    const sol = (window as any).solana;
    if (sol && sol.isPhantom) {
      return [new PhantomWalletAdapter()];
    }
    // no phantom: return empty list so the UI won't attempt to auto-connect
    return [];
  }, [hasPhantom]);

  React.useEffect(() => {
    // Quick sanity check for Phantom extension in the browser
    if (typeof window !== 'undefined') {
      // @ts-ignore
      const sol = (window as any).solana;
      setHasPhantom(Boolean(sol && sol.isPhantom));
      if (!sol || !sol.isPhantom) {
        setError('Phantom wallet extension not found — install Phantom or use a compatible wallet (or use a mobile wallet).');
      } else {
        setError(null);
      }
    }
  }, []);

  const onError = React.useCallback((err: Error) => {
    console.error('Wallet error', err);
    setError(err?.message ?? String(err));
  }, []);

  const autoConnect = false; // Never auto connect to avoid repeated unexpected errors

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={autoConnect} onError={onError}>
        <WalletModalProvider>
          {error && <div style={{color: 'crimson', marginTop: 8}}>Wallet error: {error}</div>}
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
