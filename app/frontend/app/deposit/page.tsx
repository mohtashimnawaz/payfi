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
import { FloatingInput } from '../../src/components/FloatingInput';
import { TransactionStepper, type StepStatus } from '../../src/components/TransactionStepper';
import { StatCard } from '../../src/components/AnimatedCounter';
import { PageWrapper } from '../../src/components/PageWrapper';
import { LinkIcon, PenIcon, HourglassIcon, SparkleIcon } from '../../src/components/AnimatedIcons';
import { motion } from 'framer-motion';

export default function DepositPage() {
  const { publicKey, wallet, connected } = useWallet();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState<number>(100);
  const [vaultTokenAccount, setVaultTokenAccount] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [amountError, setAmountError] = useState<string>('');

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

    // Validate amount
    if (amount <= 0) {
      setAmountError('Amount must be greater than 0');
      return;
    }
    if (amount > 1000000) {
      setAmountError('Amount too large');
      return;
    }
    setAmountError('');

    setIsLoading(true);
    setCurrentStep(1); // Sign transaction

    try {
      const connection = getConnection();
      const anchorWallet = {
        publicKey: publicKey,
        signTransaction: (wallet as any).signTransaction,
        signAllTransactions: (wallet as any).signAllTransactions,
      } as any;
      const provider = getAnchorProvider(connection, anchorWallet);
      const program = getProgram(provider);

      setCurrentStep(2); // Confirming

      const [adminPda] = await PublicKey.findProgramAddress([Buffer.from('admin')], program.programId);
      const [treePda] = await PublicKey.findProgramAddress([Buffer.from('tree_state')], program.programId);
      const [vaultPda] = await PublicKey.findProgramAddress([Buffer.from('vault')], program.programId);

      const commitment = new Uint8Array(32);
      commitment[0] = 1;

      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID });
      if (!tokenAccounts.value || tokenAccounts.value.length === 0) {
        addToast('No token accounts found. Please fund an SPL token and try again.', 'error');
        setIsLoading(false);
        setCurrentStep(0);
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

      setCurrentStep(3); // Complete
      setShowSuccess(true);
      addToast('Deposit completed successfully!', 'success');
      setTimeout(() => {
        setShowSuccess(false);
        setCurrentStep(0);
        setAmount(100);
      }, 2500);
    } catch (err: any) {
      addToast(`Deposit failed: ${err.message || String(err)}`, 'error');
      console.error(err);
      setCurrentStep(0);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PageWrapper>
      <SuccessAnimation isActive={showSuccess} />
      
      <div className="mb-12">
        <h1 className="text-5xl font-semibold text-body mb-6 tracking-tighter">Deposit <span className="prism-text">Funds</span></h1>
        <p className="text-muted text-xl max-w-2xl font-medium leading-relaxed">Securely deposit tokens into the privacy vault with full encryption.</p>
      </div>

      {/* Transaction Stepper */}
      <div className="mb-12 p-8 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
        <TransactionStepper
          currentStep={currentStep}
          steps={[
            {
              id: 'wallet',
              label: 'Connect Wallet',
              status: currentStep > 0 ? 'completed' : currentStep === 0 ? 'active' : 'pending',
              icon: LinkIcon,
            },
            {
              id: 'sign',
              label: 'Sign TX',
              status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : 'pending',
              icon: PenIcon,
            },
            {
              id: 'confirm',
              label: 'Confirming',
              status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'pending',
              icon: HourglassIcon,
            },
            {
              id: 'complete',
              label: 'Complete',
              status: currentStep >= 3 ? 'completed' : 'pending',
              icon: SparkleIcon,
            },
          ]}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <StatCard label="Deposit Amount" value={amount} suffix=" tokens" color="indigo" icon="💰" />
        <StatCard label="Network" value={1} prefix="Devnet" color="purple" icon="🌐" />
        <StatCard label="Gas Estimate" value={5000} suffix=" SOL" color="pink" icon="⚡" />
      </div>
      
      <BentoGrid>
        <div className="lg:col-span-2">
          <Card title="Deposit Transaction" badge="Secure">
            <div className="space-y-8">
                <div className="bg-transparent p-8 rounded-3xl border border-[#e6e9ef] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted mb-3 font-bold">Wallet Status</div>
                    <div className={`text-2xl font-medium tracking-tight ${connected ? 'text-emerald-400' : 'text-red-400'}`}>
                      {connected ? 'Connected' : 'Not Connected'}
                    </div>
                  </div>
                  <motion.div
                    animate={{ scale: connected ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className={`w-3 h-3 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  </motion.div>
                </div>
                
                {vaultTokenAccount && (
                  <div className="bg-transparent p-8 rounded-3xl border border-[#e6e9ef]">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted mb-3 font-bold">Vault Account</div>
                    <code className="text-xs font-mono text-muted break-all leading-relaxed">{vaultTokenAccount}</code>
                  </div>
                )}
                
                <div className="space-y-3">
                  <FloatingInput
                    label="Amount (tokens)"
                    value={amount}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setAmount(val);
                      if (val <= 0) {
                        setAmountError('Amount must be greater than 0');
                      } else if (val > 1000000) {
                        setAmountError('Amount too large');
                      } else {
                        setAmountError('');
                      }
                    }}
                    type="number"
                    error={amountError}
                    placeholder="100"
                  />
                </div>

                {/* Quick Select Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 75, 100].map((percent) => (
                    <motion.button
                      key={percent}
                      onClick={() => setAmount(Math.floor(100 * (percent / 100)))}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="py-2 px-3 text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 transition-all"
                    >
                      {percent}%
                    </motion.button>
                  ))}
                </div>
                
                <div className="flex items-center gap-4">
                  <PulseButton 
                    onClick={handleDeposit} 
                    disabled={!connected || amount <= 0}
                    isLoading={isLoading}
                    className="flex-1 text-lg"
                  >
                    Deposit Tokens
                  </PulseButton>
                  <button 
                    onClick={() => {
                      setAmount(100);
                      setAmountError('');
                    }}
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
            <li>Enter the amount and click Deposit</li>
            <li>Watch the stepper to track your transaction progress</li>
          </ol>
        </Card>
      </BentoGrid>
    </PageWrapper>
  );
}
