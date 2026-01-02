"use client";
import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { getConnection, getAnchorProvider, getProgram } from '../../src/lib/anchor';
import BentoGrid from '../../src/components/BentoGrid';
import Card from '../../src/components/Card';

export default function WithdrawPage() {
  const { publicKey, wallet, connected } = useWallet();
  const [status, setStatus] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(100);

  async function handleWithdraw() {
    if (!publicKey || !wallet) return setStatus('Please connect wallet');
    setStatus('Preparing withdraw...');
    try {
      const connection = getConnection();
      const anchorWallet = { publicKey: publicKey, signTransaction: (wallet as any).signTransaction, signAllTransactions: (wallet as any).signAllTransactions } as any;
      const provider = getAnchorProvider(connection, anchorWallet);
      const program = getProgram(provider);

      // For now withdraw requires a valid proof; this UI is a placeholder that will call the withdraw instruction with dummy data
      const nullifier = new Uint8Array(32); nullifier[0] = 2;
      const commitment = new Uint8Array(32); commitment[0] = 1;

      const [adminPda] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from('admin')], program.programId);
      const [treePda] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from('tree_state')], program.programId);
      const [vaultPda] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from('vault')], program.programId);

      setStatus('Sending withdraw (likely to fail without a real proof)...');
      await program.methods
        .withdraw(Buffer.from([]), Buffer.from(nullifier), Buffer.from(commitment), new anchor.BN(amount))
        .accounts({
          user: publicKey,
          recipientTokenAccount: publicKey,
          admin: adminPda,
          vault: vaultPda,
          vaultTokenAccount: anchor.web3.PublicKey.default,
          treeState: treePda,
          tokenProgram: anchor.web3.TOKEN_PROGRAM_ID,
        })
        .rpc();

      setStatus('Withdraw sent (check logs)');
    } catch (err: any) {
      setStatus('Withdraw failed: ' + (err.message || String(err)));
      console.error(err);
    }
  }

  return (
    <div className="container px-4 py-6 mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-slate-900">Withdraw</h1>
      <BentoGrid>
        <Card title="Withdraw">
          <div className="flex flex-col gap-4">
            <div className="text-sm text-slate-600">Connected: <span className={connected ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{connected ? 'Yes' : 'No'}</span></div>
            <label className="text-sm font-medium text-slate-700">Amount (tokens)</label>
            <input 
              type="number" 
              value={amount} 
              onChange={(e)=>setAmount(parseInt(e.target.value))} 
              className="border border-slate-300 rounded px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter amount"
            />
            <button 
              onClick={handleWithdraw} 
              disabled={!connected}
              className="bg-primary text-white font-semibold rounded px-4 py-2 disabled:opacity-50 hover:bg-accent transition-colors"
            >
              Withdraw (ZK required)
            </button>
            {status && <div className="mt-4 p-3 bg-slate-100 rounded text-sm text-slate-700 border border-slate-200">{status}</div>}
          </div>
        </Card>
        <Card title="Notes">
          <p className="text-sm text-slate-600 leading-relaxed">This page is a placeholder — withdraw flow requires valid ZK proofs or relayer attestations which the frontend can't generate yet.</p>
        </Card>
      </BentoGrid>
    </div>
  );
}
