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

  // ... rest of handlers remain the same ...

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3 text-slate-100">🔗 Relayer Management</h1>
        <p className="text-slate-400">Register and manage relayers for transaction processing.</p>
      </div>
      <BentoGrid>
        <Card title="Add Relayer">
          <div className="space-y-5">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <div className="text-sm text-slate-400 mb-1">Wallet Status</div>
              <div className={`text-lg font-semibold ${connected ? 'text-green-400' : 'text-red-400'}`}>
                {connected ? '✓ Connected' : '✗ Not Connected'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Relayer Address (Pubkey)</label>
              <input 
                type="text" 
                value={relayerAddr} 
                onChange={(e)=>setRelayerAddr(e.target.value)} 
                className="w-full text-xs"
                placeholder="Enter public key"
              />
            </div>
            
            <button 
              onClick={handleAddRelayer} 
              disabled={!connected || !relayerAddr}
              className="btn-primary w-full py-2 font-semibold"
            >
              ✅ Add Relayer
            </button>
            
            {status && (
              <div className={`p-4 rounded-lg border ${status.includes('failed') || status.includes('Failed') ? 'bg-red-500/20 border-red-500/50 text-red-300' : 'bg-green-500/20 border-green-500/50 text-green-300'}`}>
                <p className="text-sm">{status}</p>
              </div>
            )}
          </div>
        </Card>

        <Card title="Initialize Relayer State">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Withdrawal Limit</label>
              <input 
                type="number" 
                value={limit} 
                onChange={(e)=>setLimit(parseInt(e.target.value))} 
                className="w-full"
                placeholder="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Rate Limit Window (sec)</label>
              <input 
                type="number" 
                value={windowSec} 
                onChange={(e)=>setWindowSec(parseInt(e.target.value))} 
                className="w-full"
                placeholder="60"
              />
            </div>
            
            <button 
              onClick={handleInitRelayerState} 
              disabled={!connected}
              className="btn-secondary w-full py-2 font-semibold"
            >
              🚀 Initialize State
            </button>
          </div>
        </Card>

        <Card title="📋 Info">
          <div className="space-y-3 text-slate-300 text-sm">
            <p><span className="text-purple-300 font-semibold">Relayers:</span> Entities that process withdrawals and attest transactions.</p>
            <p><span className="text-purple-300 font-semibold">Rate Limiting:</span> Controls withdrawal frequency per relayer.</p>
          </div>
        </Card>
      </BentoGrid>
    </div>
  );
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
    <div className="container px-4 py-6 mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-slate-900">Relayer Management</h1>
      <BentoGrid>
        <Card title="Register Relayer">
          <div className="flex flex-col gap-4">
            <label className="text-sm font-medium text-slate-700">Relayer Public Key</label>
            <input 
              value={relayerAddr} 
              onChange={(e)=>setRelayerAddr(e.target.value)} 
              placeholder="Enter relayer pubkey" 
              className="border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <button 
              onClick={handleAddRelayer} 
              disabled={!connected}
              className="bg-primary text-white font-semibold rounded px-4 py-2 disabled:opacity-50 hover:bg-accent transition-colors"
            >
              Add Relayer (admin only)
            </button>
            {status && <div className="mt-4 p-3 bg-slate-100 rounded text-sm text-slate-700 border border-slate-200">{status}</div>}
          </div>
        </Card>

        <Card title="Init Relayer State">
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Transaction Limit</label>
              <input 
                type="number" 
                value={limit} 
                onChange={(e)=>setLimit(parseInt(e.target.value))} 
                className="w-full border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary mt-1 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Window (seconds)</label>
              <input 
                type="number" 
                value={windowSec} 
                onChange={(e)=>setWindowSec(parseInt(e.target.value))} 
                className="w-full border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary mt-1 text-sm"
              />
            </div>
            <button 
              onClick={handleInitRelayerState} 
              disabled={!connected}
              className="bg-primary text-white font-semibold rounded px-4 py-2 disabled:opacity-50 hover:bg-accent transition-colors"
            >
              Initialize Relayer State
            </button>
          </div>
        </Card>

        <Card title="Relayer State Viewer">
          <div className="flex flex-col gap-4">
            <button 
              onClick={fetchRelayerState} 
              disabled={!relayerAddr}
              className="bg-slate-600 text-white font-semibold rounded px-4 py-2 disabled:opacity-50 hover:bg-slate-700 transition-colors"
            >
              Fetch Relayer State
            </button>
            <div className="bg-slate-900 rounded p-4 text-slate-100 text-xs font-mono overflow-x-auto">
              <pre className="whitespace-pre-wrap">{JSON.stringify(relayerStateInfo, null, 2)}</pre>
            </div>
          </div>
        </Card>

      </BentoGrid>
    </div>
  );
}
