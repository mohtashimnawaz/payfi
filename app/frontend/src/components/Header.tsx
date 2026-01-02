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
    <header className="header flex items-center justify-between py-5 px-6 mb-12">
      <Link href="/" className="flex items-center gap-4 group">
        {/* Improved Animated Logo Left */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 rounded-xl animate-spin-slow blur-[2px] opacity-70 group-hover:opacity-100 transition-opacity" />
          <div className="absolute inset-[2px] bg-slate-950 rounded-[10px] flex items-center justify-center z-10">
            <span className="text-xl font-black bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent animate-pulse-soft">P</span>
          </div>
          <div className="absolute -inset-1 bg-gradient-to-tr from-purple-600/20 to-cyan-400/20 rounded-xl blur-lg group-hover:blur-xl transition-all" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors">PayFi</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">Protocol</p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="hidden lg:flex text-sm gap-1 flex-1 justify-center ml-8">
        {[
          { href: '/', label: 'Dashboard' },
          { href: '/deposit', label: 'Deposit' },
          { href: '/withdraw', label: 'Withdraw' },
          { href: '/admin', label: 'Admin' },
          { href: '/debug', label: 'Debug' },
          { href: '/relayer', label: 'Relayer' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="px-4 py-2 text-slate-400 hover:text-purple-300 rounded-lg hover:bg-purple-500/10 transition-all duration-200 relative group"
          >
            {label}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-indigo-400 group-hover:w-full transition-all duration-300" />
          </Link>
        ))}
      </nav>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <div className="text-xs text-slate-500 px-3 py-1 bg-slate-800/50 rounded-lg border border-slate-700/50">
          Devnet
        </div>
        {mounted && (
          <div className="rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 p-2 border border-purple-500/30 animate-pulse-border">
            <WalletMultiButton />
          </div>
        )}
      </div>
    </header>
  );
}
