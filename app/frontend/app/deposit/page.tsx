"use client";
import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { getConnection, getAnchorProvider, getProgram, PROGRAM_ID } from '../../src/lib/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import BentoGrid from '../../src/components/BentoGrid';
import Card from '../../src/components/Card';
import { PulseButton } from '../../src/components/Loaders';
import { SuccessAnimation } from '../../src/components/SuccessAnimation';
import { useToast } from '../../src/components/Toast';

export default function DepositPage() {
  const { publicKey, wallet, connected } = useWallet();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState<number>(100);
  const [vaultTokenAccount, setVaultTokenAccount] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function loadVault() {
      try {
        const connection = getConnection();
        const provider = getAnchorProvider(connection, (wallet as any));
        const program = getProgram(provider);
        const [vaultPda] = await PublicKey.findProgramAddress([Buffer.from('vault')], program.programId);
        const vaultState = await (program.account as any).vault.fetch(vaultPda);
        setVaultTokenAccount((vaultState as any).tokenAccount ?? (vaultState as any).token_account?.toString() ?? null);
      } catch (err) {
        console.warn('Unable to load vault state', err);
      }
    }
    loadVault();
  }, [connected, wallet]);

  async function handleDeposit() {
    if (!publicKey || !wallet) {
      addToast('Please connect wallet', 'warning');
      return;
    }
    setIsLoading(true);
    try {
      const connection = getConnection();
      const anchorWallet = {
        publicKey: publicKey,
        signTransaction: (wallet as any).signTransaction,
        signAllTransactions: (wallet as any).signAllTransactions,
      } as any;
      const provider = getAnchorProvider(connection, anchorWallet);
      const program = getProgram(provider);

      const [adminPda] = await PublicKey.findProgramAddress([Buffer.from('admin')], program.programId);
      const [treePda] = await PublicKey.findProgramAddress([Buffer.from('tree_state')], program.programId);
      const [vaultPda] = await PublicKey.findProgramAddress([Buffer.from('vault')], program.programId);

      const commitment = new Uint8Array(32);
      commitment[0] = 1;

      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID });
      if (!tokenAccounts.value || tokenAccounts.value.length === 0) {
        addToast('No token accounts found. Please fund an SPL token and try again.', 'error');
        setIsLoading(false);
        return;
      }
      const from = new PublicKey(tokenAccounts.value[0].pubkey.toString());

      await (program as any).methods
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

      setShowSuccess(true);
      addToast('Deposit completed successfully!', 'success');
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err: any) {
      addToast(`Deposit failed: ${err.message || String(err)}`, 'error');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="reveal">
      <SuccessAnimation isActive={showSuccess} />
      
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
                  <PulseButton 
                    onClick={handleDeposit} 
                    disabled={!connected}
                    isLoading={isLoading}
                    className="flex-1 text-lg"
                  >
                    Deposit Tokens
                  </PulseButton>
                  <button 
                    onClick={() => setAmount(100)}
                    className="btn-secondary"
                  >
                    Reset
                  </button>
                </div>
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
