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
    <div className="reveal">
      <div className="mb-12">
        <h1 className="text-4xl font-medium text-white mb-4 tracking-tight">Admin Panel</h1>
        <p className="text-white/40 text-lg max-w-2xl">Protocol initialization and management utilities.</p>
      </div>
      
      <BentoGrid>
        <Card title="Program Initialization" badge="Admin Only">
          <div className="space-y-6">
            <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/[0.05]">
              <div className="text-xs uppercase tracking-widest text-white/30 mb-2 font-medium">Wallet Status</div>
              <div className={`text-xl font-medium ${connected ? 'text-white' : 'text-white/20'}`}>
                {connected ? 'Connected' : 'Not Connected'}
              </div>
            </div>
            
            <button 
              onClick={handleInitialize} 
              disabled={!connected}
              className="btn-primary w-full py-4 text-lg"
            >
              Initialize Protocol
            </button>
            
            {status && (
              <div className={`p-4 rounded-xl border text-sm ${status.includes('failed') || status.includes('Failed') ? 'bg-red-500/5 border-red-500/10 text-red-400' : 'bg-white/5 border-white/10 text-white/60'}`}>
                {status}
              </div>
            )}
          </div>
        </Card>
        
        <Card title="Best Practices" badge="Setup">
          <div className="space-y-4 text-white/40 text-sm leading-relaxed">
            <p>For a complete automated setup, run the following command in your terminal:</p>
            <div className="bg-white/[0.02] p-4 rounded-xl border border-white/[0.05] font-mono text-xs text-white/60 break-all">
              pnpm ts-node scripts/init_devnet.ts
            </div>
            <p className="text-xs italic">
              This script handles mint creation, vault setup, and initial funding.
            </p>
          </div>
        </Card>
      </BentoGrid>
    </div>
  );
}
