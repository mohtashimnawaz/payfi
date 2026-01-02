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
        const vaultState = await program.account.vault.fetch(vaultPda);
        // `vaultState` will be typed when `getProgram` returns a Program<Payfi>.
        setVaultTokenAccount((vaultState as any).tokenAccount ?? (vaultState as any).token_account?.toString() ?? null);
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
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID });
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
      <div className="mb-16">
        <h1 className="text-5xl font-semibold text-body mb-6 tracking-tighter">Deposit <span className="prism-text">Funds</span></h1>
        <p className="text-muted text-xl max-w-2xl font-medium leading-relaxed">Securely deposit tokens into the privacy vault with full encryption.</p>
      </div>
      
      <BentoGrid>
        <div className="lg:col-span-2">
          <Card title="Deposit Transaction" badge="Secure">
            <div className="space-y-8">
              <div className="bg-transparent p-8 rounded-3xl border border-[#e6e9ef]">
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted mb-3 font-bold">Wallet Status</div>
                <div className={`text-2xl font-medium tracking-tight ${connected ? 'text-body' : 'text-muted'}`}>
                  {connected ? 'Connected' : 'Not Connected'}
                </div>
              </div>
              
              {vaultTokenAccount && (
                <div className="bg-transparent p-8 rounded-3xl border border-[#e6e9ef]">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-muted mb-3 font-bold">Vault Account</div>
                  <code className="text-xs font-mono text-muted break-all leading-relaxed">{vaultTokenAccount}</code>
                </div>
              )}
              
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold ml-1">Amount (tokens)</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e)=>setAmount(parseInt(e.target.value))} 
                  className="w-full bg-transparent border border-[#e6e9ef] rounded-2xl px-6 py-4 text-body text-lg focus:outline-none focus:border-indigo-500/30 transition-all"
                  placeholder="100"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleDeposit} 
                  disabled={!connected}
                  className="btn-primary flex-1 py-4 text-lg"
                >
                  Deposit Tokens
                </button>
                <button 
                  onClick={() => setAmount(100)}
                  className="btn-secondary"
                >Reset
                </button>
              </div>
              
              {status && (
                <div className={`p-5 rounded-2xl border text-sm font-medium ${status.includes('failed') || status.includes('Failed') ? 'bg-red-500/[0.02] border-red-500/10 text-red-400/60' : 'bg-transparent border border-[#e6e9ef] text-muted'}`}>
                  {status}
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card title="Instructions" badge="Guide">
          <ol className="text-sm list-decimal list-inside space-y-6 text-muted leading-relaxed font-medium">
            <li>Connect a wallet (Phantom or mobile wallet)</li>
            <li>Ensure you have an SPL token account with the same mint as the vault</li>
            <li>Click Deposit to initiate the private transaction</li>
          </ol>
        </Card>
      </BentoGrid>
    </div>
  );
}
