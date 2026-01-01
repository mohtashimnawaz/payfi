"use client";
import React from 'react';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Header() {
  return (
    <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
      <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
        <h2 style={{margin: 0}}>PayFi</h2>
        <nav>
          <Link href="/">Home</Link> {' | '}
          <Link href="/deposit">Deposit</Link> {' | '}
          <Link href="/withdraw">Withdraw</Link> {' | '}
          <Link href="/admin">Admin</Link> {' | '}
          <Link href="/debug">Debug</Link>
        </nav>
      </div>
      <div style={{display: 'flex', gap: 12}}>
        <WalletMultiButton />
      </div>
    </header>
  );
}
