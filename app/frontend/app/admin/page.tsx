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
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3 text-slate-100">⚙️ Admin Panel</h1>
        <p className="text-slate-400">Protocol initialization and management.</p>
      </div>
      <BentoGrid>
        <Card title="Program Initialization">
          <div className="space-y-5">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <div className="text-sm text-slate-400 mb-1">Wallet Status</div>
              <div className={`text-lg font-semibold ${connected ? 'text-green-400' : 'text-red-400'}`}>
                {connected ? '✓ Connected' : '✗ Not Connected'}
              </div>
            </div>
            
            <button 
              onClick={handleInitialize} 
              disabled={!connected}
              className="btn-primary w-full py-3 font-semibold text-lg"
            >
              🚀 Initialize Protocol
            </button>
            
            {status && (
              <div className={`p-4 rounded-lg border ${status.includes('failed') || status.includes('Failed') ? 'bg-red-500/20 border-red-500/50 text-red-300' : 'bg-green-500/20 border-green-500/50 text-green-300'}`}>
                <p className="text-sm">{status}</p>
              </div>
            )}
          </div>
        </Card>
        
        <Card title="📋 Best Practices">
          <div className="space-y-3 text-slate-300 text-sm">
            <p className="font-semibold text-slate-200">For complete setup:</p>
            <code className="block bg-slate-900/50 p-3 rounded text-xs font-mono text-amber-300 break-all">
              pnpm ts-node scripts/init_devnet.ts
            </code>
            <p className="text-xs text-slate-400">Full initialization script handles all setup automatically.</p>
          </div>
        </Card>
      </BentoGrid>
    </div>
  );
}
