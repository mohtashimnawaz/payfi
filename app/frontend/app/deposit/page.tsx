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
    <div className="reveal">
      <div className="mb-12">
        <h1 className="text-4xl font-medium text-white mb-4 tracking-tight">Deposit Funds</h1>
        <p className="text-white/40 text-lg max-w-2xl">Securely deposit tokens into the privacy vault with full encryption.</p>
      </div>
      
      <BentoGrid>
        <div className="lg:col-span-2">
          <Card title="Deposit Transaction" badge="Secure">
            <div className="space-y-6">
              <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/[0.05]">
                <div className="text-xs uppercase tracking-widest text-white/30 mb-2 font-medium">Wallet Status</div>
                <div className={`text-xl font-medium ${connected ? 'text-white' : 'text-white/20'}`}>
                  {connected ? 'Connected' : 'Not Connected'}
                </div>
              </div>
              
              {vaultTokenAccount && (
                <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/[0.05]">
                  <div className="text-xs uppercase tracking-widest text-white/30 mb-2 font-medium">Vault Account</div>
                  <code className="text-xs font-mono text-white/60 break-all">{vaultTokenAccount}</code>
                </div>
              )}
              
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
                onClick={handleDeposit} 
                disabled={!connected}
                className="btn-primary w-full py-4 text-lg"
              >
                Deposit Tokens
              </button>
              
              {status && (
                <div className={`p-4 rounded-xl border text-sm ${status.includes('failed') || status.includes('Failed') ? 'bg-red-500/5 border-red-500/10 text-red-400' : 'bg-white/5 border-white/10 text-white/60'}`}>
                  {status}
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card title="Instructions" badge="Guide">
          <ol className="text-sm list-decimal list-inside space-y-4 text-white/40 leading-relaxed">
            <li>Connect a wallet (Phantom or mobile wallet)</li>
            <li>Ensure you have an SPL token account with the same mint as the vault</li>
            <li>Click Deposit to initiate the private transaction</li>
          </ol>
        </Card>
      </BentoGrid>
    </div>
  );
}
