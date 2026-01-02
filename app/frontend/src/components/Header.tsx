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
    <header className="header flex items-center justify-between py-4 px-6 mb-8">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all">
            <span className="text-white font-bold text-lg">₽</span>
          </div>
          <span className="text-2xl font-bold gradient-text">PayFi</span>
        </Link>
        <nav className="hidden lg:flex text-sm gap-1">
          {[
            { href: '/', label: 'Home' },
            { href: '/deposit', label: 'Deposit' },
            { href: '/withdraw', label: 'Withdraw' },
            { href: '/admin', label: 'Admin' },
            { href: '/debug', label: 'Debug' },
            { href: '/relayer', label: 'Relayer' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-2 text-slate-400 hover:text-purple-300 rounded-lg hover:bg-purple-500/10 transition-all duration-200"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-xs text-slate-500">🌐 Devnet</div>
        {mounted && (
          <div className="rounded-lg bg-slate-800/50 border border-purple-500/30 p-1">
            <WalletMultiButton />
          </div>
        )}
      </div>
    </header>
  );
}
