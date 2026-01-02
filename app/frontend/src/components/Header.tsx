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
            {/* Rotating iridescent border */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl animate-spin-slow opacity-40 group-hover:opacity-100 transition-opacity duration-700" />
            {/* Inner background */}
            <div className="absolute inset-[1.5px] bg-[#0a0a14] rounded-[10px] flex items-center justify-center z-10">
              <span className="text-lg font-bold text-white tracking-tighter">P</span>
            </div>
          </div>
          <span className="text-lg font-medium tracking-tight text-white/90 group-hover:text-white transition-colors">PayFi</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-white/30">
          {[
            { href: '/', label: 'Dashboard' },
            { href: '/deposit', label: 'Deposit' },
            { href: '/withdraw', label: 'Withdraw' },
            { href: '/admin', label: 'Admin' },
            { href: '/relayer', label: 'Relayer' },
            { href: '/debug', label: 'Debug' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="hover:text-white/80 transition-colors duration-500 relative group"
            >
              {label}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <div className="hidden sm:block text-[11px] font-medium uppercase tracking-widest text-white/20">
            Devnet
          </div>
          {mounted && (
            <div className="prism-glow">
              <WalletMultiButton className="!bg-white !text-black !h-11 !px-6 !rounded-full !font-semibold !text-sm !transition-all !duration-500 hover:!shadow-[0_0_30px_rgba(255,255,255,0.2)] active:!scale-95" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
