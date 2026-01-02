"use client";
import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { getConnection, getAnchorProvider, getProgram } from '../../src/lib/anchor';
import BentoGrid from '../../src/components/BentoGrid';
import Card from '../../src/components/Card';

export default function RelayerPage() {
  const { publicKey, wallet, connected } = useWallet();
  const [status, setStatus] = useState<string | null>(null);
  const [relayerAddr, setRelayerAddr] = useState<string>('');
  const [limit, setLimit] = useState<number>(1);
  const [windowSec, setWindowSec] = useState<number>(60);
  const [relayerStateInfo, setRelayerStateInfo] = useState<any>(null);

  async function handleAddRelayer() {
    if (!publicKey || !wallet) return setStatus('Connect wallet');
    try {
      setStatus('Adding relayer...');
      const connection = getConnection();
      const provider = getAnchorProvider(connection, (wallet as any));
      const program = getProgram(provider);
      const [adminPda] = await PublicKey.findProgramAddress([Buffer.from('admin')], program.programId);
      const relayerPub = new PublicKey(relayerAddr);

      await program.methods
        .addRelayer(relayerPub)
        .accounts({ admin: adminPda, payer: publicKey })
        .rpc();

      setStatus('Relayer added successfully');
    } catch (err: any) {
      setStatus('Failed to add relayer: ' + (err.message || String(err)));
      console.error(err);
    }
  }

  async function handleInitRelayerState() {
    if (!publicKey || !wallet) return setStatus('Connect wallet');
    try {
      setStatus('Initializing relayer state...');
      const connection = getConnection();
      const provider = getAnchorProvider(connection, (wallet as any));
      const program = getProgram(provider);
      const relayerPub = new PublicKey(relayerAddr);
      const [relayerStatePda] = await PublicKey.findProgramAddress([Buffer.from('relayer_state'), relayerPub.toBuffer()], program.programId);

      await program.methods
        .initRelayerState(relayerPub, new anchor.BN(limit), new anchor.BN(windowSec))
        .accounts({ relayerState: relayerStatePda, payer: publicKey, systemProgram: SystemProgram.programId })
        .rpc();

      setStatus('Relayer state initialized');
    } catch (err: any) {
      setStatus('Init relayer state failed: ' + (err.message || String(err)));
      console.error(err);
    }
  }

  async function fetchRelayerState() {
    if (!relayerAddr) return setStatus('Enter relayer pubkey first');
    try {
      setStatus('Fetching relayer state...');
      const connection = getConnection();
      const provider = getAnchorProvider(connection, { publicKey: PublicKey.default } as any);
      const program = getProgram(provider);
      const relayerPub = new PublicKey(relayerAddr);
      const [relayerStatePda] = await PublicKey.findProgramAddress([Buffer.from('relayer_state'), relayerPub.toBuffer()], program.programId);
      const info = await program.account.relayerState.fetchNullable(relayerStatePda);
      setRelayerStateInfo(info);
      setStatus('Fetched relayer state');
    } catch (err: any) {
      setStatus('Fetch failed: ' + (err.message || String(err)));
      console.error(err);
    }
  }

  return (
    <div className="reveal">
      <div className="mb-16">
        <h1 className="text-5xl font-semibold text-body mb-6 tracking-tighter">Relayer <span className="prism-text">Network</span></h1>
        <p className="text-muted text-xl max-w-2xl font-medium leading-relaxed">Register and manage relayers for transaction processing and attestation.</p>
      </div>
      
      <BentoGrid>
        <Card title="Add Relayer" badge="Registry">
          <div className="space-y-8">
            <div className="bg-transparent p-8 rounded-3xl border border-[#e6e9ef]">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted mb-3 font-bold">Wallet Status</div>
              <div className={`text-2xl font-medium tracking-tight ${connected ? 'text-body' : 'text-muted'}`}>
                {connected ? 'Connected' : 'Not Connected'}
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold ml-1">Relayer Address (Pubkey)</label>
              <input 
                type="text" 
                value={relayerAddr} 
                onChange={(e)=>setRelayerAddr(e.target.value)} 
                className="w-full bg-transparent border border-[#e6e9ef] rounded-2xl px-6 py-4 text-body placeholder:text-muted focus:outline-none focus:border-[#e6e9ef] transition-colors font-medium"
                placeholder="Enter public key"
              />
            </div>
            
            <button 
              onClick={handleAddRelayer} 
              disabled={!connected || !relayerAddr}
              className="btn-primary w-full py-5 text-xl tracking-tight"
            >
              Add Relayer
            </button>
            
            {status && (
              <div className={`p-5 rounded-2xl border text-sm font-medium ${status.includes('failed') || status.includes('Failed') ? 'bg-red-500/[0.02] border-red-500/10 text-red-400/60' : 'bg-transparent border border-[#e6e9ef] text-muted'}`}>
                {status}
              </div>
            )}
          </div>
        </Card>

        <Card title="Initialize State" badge="Config">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold ml-1">Withdrawal Limit</label>
              <input 
                type="number" 
                value={limit} 
                onChange={(e)=>setLimit(parseInt(e.target.value))} 
                className="w-full bg-transparent border border-[#e6e9ef] rounded-2xl px-6 py-4 text-body focus:outline-none focus:border-indigo-500/30 transition-colors font-medium"
                placeholder="1"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold ml-1">Rate Limit Window (sec)</label>
              <input 
                type="number" 
                value={windowSec} 
                onChange={(e)=>setWindowSec(parseInt(e.target.value))} 
                className="w-full bg-transparent border border-[#e6e9ef] rounded-2xl px-6 py-4 text-body focus:outline-none focus:border-indigo-500/30 transition-colors font-medium"
                placeholder="60"
              />
            </div>
            
            <button 
              onClick={handleInitRelayerState} 
              disabled={!connected}
              className="w-full bg-transparent hover:bg-[#f2f4f7] text-body py-4 rounded-2xl font-semibold transition-all border border-[#e6e9ef]"
            >
              Initialize State
            </button>
          </div>
        </Card>

        <Card title="Relayer State" badge="Viewer">
          <div className="space-y-4">
            <button 
              onClick={fetchRelayerState} 
              disabled={!relayerAddr}
              className="w-full bg-transparent hover:bg-[#f2f4f7] text-body py-3 rounded-2xl font-semibold transition-all border border-[#e6e9ef] text-xs"
            >
              Fetch State
            </button>
            <div className="bg-transparent p-6 rounded-2xl border border-[#e6e9ef] overflow-x-auto max-h-48">
              <pre className="text-[10px] font-mono text-muted whitespace-pre-wrap break-words leading-relaxed">
                {relayerStateInfo ? JSON.stringify(relayerStateInfo, null, 2) : 'No data loaded.'}
              </pre>
            </div>
          </div>
        </Card>
      </BentoGrid>
    </div>
  );
}

