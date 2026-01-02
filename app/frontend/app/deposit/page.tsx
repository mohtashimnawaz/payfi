"use client";
import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { getConnection, getAnchorProvider, getProgram, PROGRAM_ID } from '../../src/lib/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
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
          tokenProgram: TOKEN_PROGRAM_ID,
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
      <div className="mb-10 animate-fadeInUp">
        <h1 className="text-4xl font-bold mb-3 gradient-text">Deposit Funds</h1>
        <p className="text-slate-400">Securely deposit tokens into the privacy vault with full encryption.</p>
      </div>
      <BentoGrid>
        <div className="lg:col-span-2">
          <Card title="Deposit Transaction">
            <div className="space-y-5">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                <div className="text-sm text-slate-400 mb-1">Wallet Status</div>
                <div className={`text-lg font-semibold ${connected ? 'text-green-400' : 'text-red-400'}`}>
                  {connected ? '✓ Connected' : '✗ Not Connected'}
                </div>
              </div>
              
              {vaultTokenAccount && (
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                  <div className="text-sm text-slate-400 mb-2">Vault Account</div>
                  <code className="text-xs font-mono text-purple-300 break-all">{vaultTokenAccount}</code>
                </div>
              )}
              
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
                onClick={handleDeposit} 
                disabled={!connected}
                className="btn-primary w-full py-3 font-semibold text-lg"
              >
                💎 Execute Deposit
              </button>
              
              {status && (
                <div className={`p-4 rounded-lg border ${status.includes('failed') || status.includes('Failed') ? 'bg-red-500/20 border-red-500/50 text-red-300' : 'bg-purple-500/20 border-purple-500/50 text-purple-300'}`}>
                  <p className="text-sm">{status}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
        <Card title="ℹ️ Instructions">
          <ol className="text-sm list-decimal list-inside space-y-2 text-slate-300">
            <li>Connect a wallet (Phantom or mobile wallet)</li>
            <li>Ensure you have an SPL token account with the same mint as the vault</li>
            <li>Click Deposit</li>
          </ol>
        </Card>
      </BentoGrid>
    </div>
  );
}
