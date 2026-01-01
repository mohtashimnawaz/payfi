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
      <h1>Withdraw</h1>
      <BentoGrid>
        <Card title="Withdraw">
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            <div>Connected: {connected ? 'Yes' : 'No'}</div>
            <label>Amount</label>
            <input type="number" value={amount} onChange={(e)=>setAmount(parseInt(e.target.value))} />
            <button onClick={handleWithdraw} disabled={!connected}>Withdraw (placeholder)</button>
            {status && <div style={{marginTop: 8}}>{status}</div>}
          </div>
        </Card>
        <Card title="Notes">
          <p>This page is a placeholder — withdraw flow requires valid ZK proofs or relayer attestations which the frontend can't generate yet.</p>
        </Card>
      </BentoGrid>
    </div>
  );
}
