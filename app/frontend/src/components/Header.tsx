"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Header() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="flex items-center justify-between py-4 border-b border-slate-200">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-xl font-bold text-primary hover:opacity-80">PayFi</Link>
        <nav className="hidden sm:flex text-sm text-slate-600 gap-4">
          <Link href="/" className="hover:text-slate-900 hover:underline transition">Home</Link>
          <Link href="/deposit" className="hover:text-slate-900 hover:underline transition">Deposit</Link>
          <Link href="/withdraw" className="hover:text-slate-900 hover:underline transition">Withdraw</Link>
          <Link href="/admin" className="hover:text-slate-900 hover:underline transition">Admin</Link>
          <Link href="/debug" className="hover:text-slate-900 hover:underline transition">Debug</Link>
          <Link href="/relayer" className="hover:text-slate-900 hover:underline transition">Relayer</Link>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        {mounted && <WalletMultiButton />}
      </div>
    </header>
  );
}
