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
      <Link href="/" className="flex items-center gap-3 group">
        {/* Animated Logo Left */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl animate-float" style={{animationDuration: '3s'}} />
          <div className="absolute inset-1 bg-slate-950 rounded-lg flex items-center justify-center group-hover:bg-slate-900 transition-colors">
            <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent animate-pulse">P</span>
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold gradient-text">PayFi</h1>
          <p className="text-xs text-slate-500 -mt-1">Finance Protocol</p>
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
        
        {/* Animated Logo Right */}
        <div className="hidden sm:flex relative w-10 h-10">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg animate-float" style={{animationDuration: '4s', animationDelay: '0.5s'}} />
          <div className="absolute inset-1 bg-slate-950 rounded-md flex items-center justify-center">
            <span className="text-xs font-bold text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text">F</span>
          </div>
        </div>
      </div>
    </header>
  );
}
