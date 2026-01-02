"use client";
import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { getConnection, getAnchorProvider, getProgram } from '../../src/lib/anchor';
import BentoGrid from '../../src/components/BentoGrid';
import Card from '../../src/components/Card';

export default function AdminPage(){
  const { publicKey, wallet, connected } = useWallet();
  const [status, setStatus] = useState<string | null>(null);

  async function handleInitialize(){
    if (!publicKey || !wallet) return setStatus('Connect wallet as payer');
    try{
      setStatus('Initializing...');
      const connection = getConnection();
      const anchorWallet = { publicKey: publicKey, signTransaction: (wallet as any).signTransaction, signAllTransactions: (wallet as any).signAllTransactions } as any;
      const provider = getAnchorProvider(connection, anchorWallet);
      const program = getProgram(provider);

      const [adminPda, adminBump] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from('admin')], program.programId);
      const [treePda, treeBump] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from('tree_state')], program.programId);
      const [nullsManagerPda, nullsManagerBump] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from('nullifier_manager')], program.programId);
      const [vaultPda, vaultBump] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from('vault')], program.programId);

      // For simplicity, create a mint and vault token account client-side would be heavy; instruct user to run scripts/init_devnet or use devnet
      await program.methods
        .initialize(publicKey, anchor.web3.PublicKey.default, vaultBump, treeBump, new anchor.BN(1000), adminBump)
        .accounts({ admin: adminPda, treeState: treePda, nullifierManager: nullsManagerPda, vault: vaultPda, payer: publicKey, systemProgram: anchor.web3.SystemProgram.programId, rent: anchor.web3.SYSVAR_RENT_PUBKEY })
        .rpc();
      setStatus('Initialize call succeeded');
    }catch(err:any){
      setStatus('Initialize failed: ' + (err.message || String(err)));
      console.error(err);
    }
  }

  return (
    <div className="container px-4 py-6 mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-slate-900">Admin Panel</h1>
      <BentoGrid>
        <Card title="Initialize Program">
          <div className="flex flex-col gap-4">
            <div className="text-sm text-slate-600">Connected: <span className={connected ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{connected ? 'Yes' : 'No'}</span></div>
            <button 
              onClick={handleInitialize} 
              disabled={!connected}
              className="bg-primary text-white font-semibold rounded px-4 py-2 disabled:opacity-50 hover:bg-accent transition-colors"
            >
              Call Initialize
            </button>
            {status && <div className="mt-4 p-3 bg-slate-100 rounded text-sm text-slate-700 border border-slate-200">{status}</div>}
          </div>
        </Card>
        <Card title="Notes">
          <p className="text-sm text-slate-600 leading-relaxed">Use the <code className="bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-800">scripts/init_devnet.ts</code> script for full initialization (recommended).</p>
        </Card>
      </BentoGrid>
    </div>
  );
}
