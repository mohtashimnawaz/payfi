"use client";
import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { getConnection, getAnchorProvider, getProgram } from '../../src/lib/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import BentoGrid from '../../src/components/BentoGrid';
import Card from '../../src/components/Card';
import { FloatingInput } from '../../src/components/FloatingInput';
import { TransactionStepper } from '../../src/components/TransactionStepper';
import { PageWrapper } from '../../src/components/PageWrapper';
import { ScrollReveal, Parallax } from '../../src/components/ScrollAnimations';
import { PercentageBar, CircularProgress } from '../../src/components/DataVisualization';
import { ShieldIcon, WalletIcon, LockIcon, CheckmarkIcon, CurrencyIcon, BoltIcon } from '../../src/components/AnimatedIcons';
import { motion } from 'framer-motion';

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  subtext?: string;
}

export default function WithdrawPage() {
  const { publicKey, wallet, connected } = useWallet();
  const [status, setStatus] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(100);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const steps = [
    { id: 'proof', label: 'Proof', status: 'pending' as const, icon: <ShieldIcon size={20} className="text-white" animate={false} /> },
    { id: 'verify', label: 'Verify', status: 'pending' as const, icon: <LockIcon size={20} className="text-white" animate={false} /> },
    { id: 'sign', label: 'Sign', status: 'pending' as const, icon: <WalletIcon size={20} className="text-white" animate={false} /> },
    { id: 'complete', label: 'Complete', status: 'pending' as const, icon: <CheckmarkIcon size={20} className="text-white" animate={false} /> },
  ];

  const statCards: StatCard[] = [
    {
      label: 'Withdrawal Amount',
      value: amount.toLocaleString(),
      icon: <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}><CurrencyIcon size={24} className="text-emerald-400" animate={false} /></motion.div>,
      subtext: 'USDC'
    },
    {
      label: 'Network Status',
      value: connected ? 'Active' : 'Disconnected',
      icon: <div className="w-3 h-3 rounded-full" style={{ background: connected ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)' }} />,
    },
    {
      label: 'Transaction Fee',
      value: '0.01',
      icon: <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity }}><BoltIcon size={24} className="text-yellow-400" animate={false} /></motion.div>,
      subtext: 'SOL'
    },
  ];

  async function handleWithdraw() {
    if (!publicKey || !wallet) {
      setError('Please connect wallet');
      return;
    }
    
    setError('');
    setCurrentStep(0);
    setStatus('Preparing withdraw...');

    try {
      setCurrentStep(1);
      const connection = getConnection();
      const anchorWallet = {
        publicKey: publicKey,
        signTransaction: (wallet as any).signTransaction,
        signAllTransactions: (wallet as any).signAllTransactions
      } as any;
      const provider = getAnchorProvider(connection, anchorWallet);
      const program = getProgram(provider);

      setCurrentStep(2);
      const nullifier = new Uint8Array(32);
      nullifier[0] = 2;
      const commitment = new Uint8Array(32);
      commitment[0] = 1;

      const [adminPda] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from('admin')], program.programId);
      const [treePda] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from('tree_state')], program.programId);
      const [vaultPda] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from('vault')], program.programId);

      setCurrentStep(3);
      setStatus('Sending withdraw transaction...');
      
      await (program as any).methods
        .withdraw(Buffer.from([]), Buffer.from(nullifier), Buffer.from(commitment), new anchor.BN(amount))
        .accounts({
          user: publicKey,
          recipientTokenAccount: publicKey,
          admin: adminPda,
          vault: vaultPda,
          vaultTokenAccount: anchor.web3.PublicKey.default,
          treeState: treePda,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      setWithdrawSuccess(true);
      setStatus('Withdrawal successful!');
      setTimeout(() => setWithdrawSuccess(false), 5000);
    } catch (err: any) {
      setError('Withdraw failed: ' + (err.message || String(err)));
      setStatus(null);
      console.error(err);
    }
  }

  const maxAmount = 10000;
  const progressPercent = (amount / maxAmount) * 100;

  return (
    <PageWrapper>
      <div className="reveal">
        <div className="mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-6xl font-bold text-body mb-6 tracking-tighter">
              Withdraw <span className="prism-text">Assets</span>
            </h1>
            <p className="text-muted text-xl max-w-2xl font-medium leading-relaxed">
              Securely withdraw your tokens with zero-knowledge proofs and relayer attestation protection.
            </p>
          </motion.div>
        </div>

        {/* Transaction Stepper */}
        <ScrollReveal className="mb-16">
          <div className="card p-8 rounded-3xl">
            <TransactionStepper currentStep={currentStep} steps={steps} />
          </div>
        </ScrollReveal>

        {/* Stat Cards */}
        <ScrollReveal className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="card p-6 rounded-2xl h-full hover:depth-2 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted text-sm font-medium">{card.label}</span>
                    <div className="text-2xl">{card.icon}</div>
                  </div>
                  <div className="text-3xl font-bold text-body">{card.value}</div>
                  {card.subtext && <div className="text-xs text-muted mt-2">{card.subtext}</div>}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        <BentoGrid>
          <div className="lg:col-span-2">
            <Card title="Withdrawal Request" badge="Private">
              <div className="space-y-8">
                <Parallax offset={20}>
                  <div className="bg-gradient-to-br from-indigo-500/[0.05] to-purple-500/[0.05] p-8 rounded-3xl border border-indigo-500/20 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <WalletIcon size={20} className="text-indigo-400" />
                      <div className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold">Wallet Status</div>
                    </div>
                    <div className={`text-2xl font-semibold tracking-tight ${connected ? 'text-emerald-400' : 'text-red-400'}`}>
                      {connected ? 'Connected' : 'Not Connected'}
                    </div>
                  </div>
                </Parallax>

                <FloatingInput
                  label="Withdrawal Amount"
                  type="number"
                  value={amount.toString()}
                  onChange={(e) => {
                    setAmount(parseInt(e.target.value) || 0);
                    setError('');
                  }}
                  error={error}
                  placeholder="Enter amount"
                />

                {/* Visualization */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted">Withdrawal Progress</span>
                    <span className="text-xs text-muted">{progressPercent.toFixed(1)}%</span>
                  </div>
                  <PercentageBar percentage={Math.min(progressPercent, 100)} color="indigo" />
                </div>

                {/* Quick Select Buttons */}
                <div className="grid grid-cols-4 gap-3">
                  {[25, 50, 75, 100].map((percent) => (
                    <motion.button
                      key={percent}
                      onClick={() => setAmount(Math.floor((percent / 100) * maxAmount))}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-secondary py-3 text-sm font-medium"
                    >
                      {percent}%
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  onClick={handleWithdraw}
                  disabled={!connected || withdrawSuccess}
                  whileHover={!connected || withdrawSuccess ? {} : { scale: 1.02 }}
                  whileTap={!connected || withdrawSuccess ? {} : { scale: 0.98 }}
                  className="btn-primary w-full py-5 text-lg font-semibold tracking-tight"
                >
                  {withdrawSuccess ? 'Withdrawal Complete!' : 'Initiate Withdrawal'}
                </motion.button>

                {status && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl border bg-emerald-500/[0.05] border-emerald-500/20 text-emerald-300 text-sm font-medium text-center"
                  >
                    ✓ {status}
                  </motion.div>
                )}
              </div>
            </Card>
          </div>

          <ScrollReveal>
            <Card title="Requirements" badge="Important">
              <div className="space-y-6 text-muted text-sm leading-relaxed font-medium">
                <div className="flex gap-4 items-start">
                  <ShieldIcon size={20} className="text-indigo-400 flex-shrink-0 mt-1" animate={false} />
                  <div>
                    <div className="font-semibold text-body mb-1">Zero-Knowledge Proofs</div>
                    <p>Valid cryptographic proofs required</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <LockIcon size={20} className="text-purple-400 flex-shrink-0 mt-1" animate={false} />
                  <div>
                    <div className="font-semibold text-body mb-1">Relayer Attestation</div>
                    <p>Optional network attestation for security</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                    <CheckmarkIcon size={20} className="text-emerald-400 flex-shrink-0 mt-1" animate={false} />
                  </motion.div>
                  <div>
                    <div className="font-semibold text-body mb-1">Vault Liquidity</div>
                    <p>Sufficient funds available for withdrawal</p>
                  </div>
                </div>
              </div>
            </Card>
          </ScrollReveal>
        </BentoGrid>
      </div>
    </PageWrapper>
  );
}
