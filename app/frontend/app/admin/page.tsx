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
      // Cast the `methods` chain to `any` to avoid deep generic instantiation issues
      await (program as any).methods
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
      <div className="mb-16">
        <h1 className="text-5xl font-semibold text-body mb-6 tracking-tighter">Admin <span className="prism-text">Panel</span></h1>
        <p className="text-muted text-xl max-w-2xl font-medium leading-relaxed">Protocol initialization and management utilities.</p>
      </div>
      
      <BentoGrid>
        <Card title="Program Initialization" badge="Admin Only">
          <div className="space-y-8">
            <div className="bg-transparent p-8 rounded-3xl border border-[#e6e9ef]">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted mb-3 font-bold">Wallet Status</div>
              <div className={`text-2xl font-medium tracking-tight ${connected ? 'text-body' : 'text-muted'}`}>
                {connected ? 'Connected' : 'Not Connected'}
              </div>
            </div>
            
            <button 
              onClick={handleInitialize} 
              disabled={!connected}
              className="btn-primary w-full py-5 text-xl tracking-tight"
            >
              Initialize Protocol
            </button>
            
            {status && (
              <div className={`p-5 rounded-2xl border text-sm font-medium ${status.includes('failed') || status.includes('Failed') ? 'bg-red-500/[0.02] border-red-500/10 text-red-400/60' : 'bg-transparent border border-[#e6e9ef] text-muted'}`}>
                {status}
              </div>
            )}
          </div>
        </Card>
        
        <Card title="Best Practices" badge="Setup">
          <div className="space-y-6 text-muted text-sm leading-relaxed font-medium">
            <p>For a complete automated setup, run the following command in your terminal:</p>
            <div className="bg-transparent p-6 rounded-2xl border border-[#e6e9ef] font-mono text-xs text-muted break-all leading-relaxed">
              pnpm ts-node scripts/init_devnet.ts
            </div>
            <p className="text-xs italic pt-4 border-t border-[#e6e9ef]">
              This script handles mint creation, vault setup, and initial funding.
            </p>
          </div>
        </Card>
      </BentoGrid>
    </div>
  );
}
