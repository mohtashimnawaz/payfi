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
    <header className="header py-6 px-8 mb-16">
      <div className="container flex items-center justify-between">
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Rotating gradient border */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-white/5 to-white/40 rounded-xl animate-spin-slow" />
            {/* Inner background */}
            <div className="absolute inset-[1px] bg-[#050505] rounded-[11px] flex items-center justify-center z-10">
              <span className="text-lg font-bold text-white tracking-tighter">P</span>
            </div>
          </div>
          <span className="text-lg font-medium tracking-tight text-white group-hover:text-white/80 transition-colors">PayFi</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-white/40">
          {[
            { href: '/', label: 'Dashboard' },
            { href: '/deposit', label: 'Deposit' },
            { href: '/withdraw', label: 'Withdraw' },
            { href: '/admin', label: 'Admin' },
            { href: '/relayer', label: 'Relayer' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="hover:text-white transition-colors duration-300"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <div className="hidden sm:block text-[11px] font-medium uppercase tracking-widest text-white/20">
            Devnet
          </div>
          {mounted && (
            <div className="wallet-wrapper">
              <WalletMultiButton />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
