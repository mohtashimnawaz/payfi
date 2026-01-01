"use client";
import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { getConnection, getAnchorProvider, getProgram, PROGRAM_ID } from '../../src/lib/anchor';
import BentoGrid from '../../src/components/BentoGrid';
import Card from '../../src/components/Card';

export default function DepositPage() {
  const { publicKey, wallet, connected } = useWallet();
  const [status, setStatus] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(100);
  const [vaultTokenAccount, setVaultTokenAccount] = useState<string | null>(null);

  useEffect(() => {
    async function loadVault() {
      try {
        const connection = getConnection();
        const provider = getAnchorProvider(connection, (wallet as any));
        const program = getProgram(provider);
        const [vaultPda] = await PublicKey.findProgramAddress([Buffer.from('vault')], program.programId);
        const vaultState: any = await program.account.vault.fetch(vaultPda);
        setVaultTokenAccount(vaultState.tokenAccount ?? vaultState.token_account?.toString() ?? null);
      } catch (err) {
        console.warn('Unable to load vault state', err);
      }
    }
    loadVault();
  }, [connected, wallet]);

  async function handleDeposit() {
    if (!publicKey || !wallet) return setStatus('Please connect wallet');
    setStatus('Preparing deposit...');
    try {
      const connection = getConnection();
      // Build small anchor wallet adapter for provider
      const anchorWallet = {
        publicKey: publicKey,
        signTransaction: (wallet as any).signTransaction,
        signAllTransactions: (wallet as any).signAllTransactions,
      } as any;
      const provider = getAnchorProvider(connection, anchorWallet);
      const program = getProgram(provider);

      // Find PDAs
      const [adminPda] = await PublicKey.findProgramAddress([Buffer.from('admin')], program.programId);
      const [treePda] = await PublicKey.findProgramAddress([Buffer.from('tree_state')], program.programId);
      const [vaultPda] = await PublicKey.findProgramAddress([Buffer.from('vault')], program.programId);

      // For demo, commitment is simple zero-filled buffer with a small byte
      const commitment = new Uint8Array(32);
      commitment[0] = 1;

      // Use first token account for user's wallet as from account
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, { programId: anchor.web3.TOKEN_PROGRAM_ID });
      if (!tokenAccounts.value || tokenAccounts.value.length === 0) {
        setStatus('No token accounts found for your wallet. Please fund a SPL token and try again.');
        return;
      }
      const from = new PublicKey(tokenAccounts.value[0].pubkey.toString());

      setStatus('Sending deposit transaction...');
      await program.methods
        .deposit(new anchor.BN(amount), Buffer.from(commitment), null)
        .accounts({
          user: publicKey,
          from: from,
          admin: adminPda,
          vault: vaultPda,
          vaultTokenAccount: new PublicKey(vaultTokenAccount ?? ''),
          treeState: treePda,
          tokenProgram: anchor.web3.TOKEN_PROGRAM_ID,
        })
        .rpc();

      setStatus('Deposit complete');
    } catch (err: any) {
      setStatus('Deposit failed: ' + (err.message || String(err)));
      console.error(err);
    }
  }

  return (
    <div>
      <h1>Deposit</h1>
      <BentoGrid>
        <Card title="Deposit">
          <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
            <div>Connected: {connected ? 'Yes' : 'No'}</div>
            <div>Vault token account: {vaultTokenAccount ?? 'unknown'}</div>
            <label>Amount</label>
            <input type="number" value={amount} onChange={(e)=>setAmount(parseInt(e.target.value))} />
            <button onClick={handleDeposit} disabled={!connected}>Deposit</button>
            {status && <div style={{marginTop: 8}}>{status}</div>}
          </div>
        </Card>
        <Card title="Instructions">
          <ol>
            <li>Connect a wallet (Phantom)</li>
            <li>Ensure you have an SPL token account with the same mint as the vault</li>
            <li>Click Deposit</li>
          </ol>
        </Card>
      </BentoGrid>
    </div>
  );
}
