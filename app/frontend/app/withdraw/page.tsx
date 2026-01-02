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
    <div className="reveal">
      <div className="mb-12">
        <h1 className="text-4xl font-medium text-white mb-4 tracking-tight">Withdraw Funds</h1>
        <p className="text-white/40 text-lg max-w-2xl">Withdraw tokens with valid zero-knowledge proofs or relayer attestation.</p>
      </div>
      
      <BentoGrid>
        <div className="lg:col-span-2">
          <Card title="Withdrawal Request" badge="Private">
            <div className="space-y-6">
              <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/[0.05]">
                <div className="text-xs uppercase tracking-widest text-white/30 mb-2 font-medium">Wallet Status</div>
                <div className={`text-xl font-medium ${connected ? 'text-white' : 'text-white/20'}`}>
                  {connected ? 'Connected' : 'Not Connected'}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/30 font-medium ml-1">Amount (tokens)</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e)=>setAmount(parseInt(e.target.value))} 
                  className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="100"
                />
              </div>
              
              <button 
                onClick={handleWithdraw} 
                disabled={!connected}
                className="btn-primary w-full py-4 text-lg"
              >
                Initiate Withdrawal
              </button>
              
              {status && (
                <div className={`p-4 rounded-xl border text-sm ${status.includes('failed') || status.includes('Failed') ? 'bg-red-500/5 border-red-500/10 text-red-400' : 'bg-white/5 border-white/10 text-white/60'}`}>
                  {status}
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card title="Requirements" badge="Important">
          <div className="space-y-4 text-white/40 text-sm leading-relaxed">
            <p>This withdrawal flow requires:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Valid zero-knowledge proofs</li>
              <li>Relayer attestation (if applicable)</li>
              <li>Sufficient vault liquidity</li>
            </ul>
            <p className="pt-4 border-t border-white/[0.05] text-xs italic">
              Note: This is a placeholder UI for demonstration purposes.
            </p>
          </div>
        </Card>
      </BentoGrid>
    </div>
  );
}
