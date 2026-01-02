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
    <div>
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-3 text-slate-100">💰 Withdraw Funds</h1>
        <p className="text-slate-400">Withdraw tokens with valid ZK proofs or relayer attestation.</p>
      </div>
      <BentoGrid>
        <div className="lg:col-span-2">
          <Card title="Withdrawal Request">
            <div className="space-y-5">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                <div className="text-sm text-slate-400 mb-1">Wallet Status</div>
                <div className={`text-lg font-semibold ${connected ? 'text-green-400' : 'text-red-400'}`}>
                  {connected ? '✓ Connected' : '✗ Not Connected'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Amount (tokens)</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e)=>setAmount(parseInt(e.target.value))} 
                  className="w-full"
                  placeholder="100"
                />
              </div>
              
              <button 
                onClick={handleWithdraw} 
                disabled={!connected}
                className="btn-primary w-full py-3 font-semibold text-lg"
              >
                🔓 Initiate Withdrawal
              </button>
              
              {status && (
                <div className={`p-4 rounded-lg border ${status.includes('failed') || status.includes('Failed') ? 'bg-red-500/20 border-red-500/50 text-red-300' : 'bg-purple-500/20 border-purple-500/50 text-purple-300'}`}>
                  <p className="text-sm">{status}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
        <Card title="⚠️ Important">
          <div className="space-y-3 text-slate-300">
            <p className="text-sm">This withdrawal flow requires:</p>
            <ul className="text-xs space-y-1 list-disc list-inside text-slate-400">
              <li>Valid zero-knowledge proofs</li>
              <li>Or relayer attestation</li>
              <li>Frontend can't generate ZK proofs yet</li>
            </ul>
          </div>
        </Card>
      </BentoGrid>
    </div>
  );
}
