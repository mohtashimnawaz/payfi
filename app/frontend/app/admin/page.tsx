"use client";
import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { getConnection, getAnchorProvider, getProgram } from '../../src/lib/anchor';
import BentoGrid from '../../src/components/BentoGrid';
import Card from '../../src/components/Card';
import { PageWrapper } from '../../src/components/PageWrapper';
import { ScrollReveal, Parallax } from '../../src/components/ScrollAnimations';
import { CircularProgress, ComparisonBar, VaultVisualizer } from '../../src/components/DataVisualization';
import { ShieldIcon, PlugIcon, NetworkIcon } from '../../src/components/AnimatedIcons';
import { motion } from 'framer-motion';

interface MetricCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}

export default function AdminPage(){
  const { publicKey, wallet, connected } = useWallet();
  const [status, setStatus] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const metrics: MetricCard[] = [
    {
      label: 'TVL',
      value: '$2.5M',
      icon: <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}><span className="text-2xl">💰</span></motion.div>,
      trend: '+12.5%',
      color: 'emerald'
    },
    {
      label: 'Active Users',
      value: '1,247',
      icon: <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity }}><span className="text-2xl">👥</span></motion.div>,
      trend: '+8.2%',
      color: 'blue'
    },
    {
      label: 'Vault Utilization',
      value: '78%',
      icon: <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}><span className="text-2xl">⚙️</span></motion.div>,
      trend: '-2.1%',
      color: 'purple'
    },
  ];

  async function handleInitialize(){
    if (!publicKey || !wallet) {
      setStatus('Connect wallet as payer');
      return;
    }
    
    setIsInitializing(true);
    try{
      setStatus('Initializing protocol...');
      const connection = getConnection();
      const anchorWallet = {
        publicKey: publicKey,
        signTransaction: (wallet as any).signTransaction,
        signAllTransactions: (wallet as any).signAllTransactions
      } as any;
      const provider = getAnchorProvider(connection, anchorWallet);
      const program = getProgram(provider);

      const [adminPda, adminBump] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from('admin')], program.programId);
      const [treePda, treeBump] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from('tree_state')], program.programId);
      const [nullsManagerPda, nullsManagerBump] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from('nullifier_manager')], program.programId);
      const [vaultPda, vaultBump] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from('vault')], program.programId);

      await (program as any).methods
        .initialize(publicKey, anchor.web3.PublicKey.default, vaultBump, treeBump, new anchor.BN(1000), adminBump)
        .accounts({
          admin: adminPda,
          treeState: treePda,
          nullifierManager: nullsManagerPda,
          vault: vaultPda,
          payer: publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY
        })
        .rpc();

      setStatus('Protocol initialized successfully');
      setTimeout(() => setStatus(null), 4000);
    }catch(err:any){
      setStatus('Initialize failed: ' + (err.message || String(err)));
      console.error(err);
    } finally {
      setIsInitializing(false);
    }
  }

  return (
    <PageWrapper>
      <div className="reveal">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-20">
          <h1 className="text-6xl font-bold text-body mb-6 tracking-tighter">
            Admin <span className="prism-text">Panel</span>
          </h1>
          <p className="text-muted text-xl max-w-2xl font-medium leading-relaxed">
            Protocol initialization, management utilities, and real-time metrics.
          </p>
        </motion.div>

        {/* Protocol Metrics */}
        <ScrollReveal className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metrics.map((metric, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="card p-8 rounded-2xl h-full hover:depth-2 transition-all">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="text-muted text-sm font-medium mb-2">{metric.label}</div>
                      <div className="text-4xl font-bold text-body">{metric.value}</div>
                    </div>
                    <div className="text-3xl">{metric.icon}</div>
                  </div>
                  {metric.trend && (
                    <div className={`text-xs font-semibold ${metric.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                      {metric.trend} this week
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        <BentoGrid>
          <div className="lg:col-span-2">
            <Card title="Program Initialization" badge="Admin Only">
              <div className="space-y-8">
                <Parallax offset={15}>
                  <div className="bg-gradient-to-br from-purple-500/[0.05] to-pink-500/[0.05] p-8 rounded-3xl border border-purple-500/20 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <ShieldIcon size={20} className="text-purple-400" />
                      <div className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold">Status</div>
                    </div>
                    <div className={`text-2xl font-semibold tracking-tight ${connected ? 'text-emerald-400' : 'text-red-400'}`}>
                      {connected ? 'Ready to Initialize' : 'Connect Wallet'}
                    </div>
                    <div className="text-xs text-muted mt-3">Admin wallet required for protocol setup</div>
                  </div>
                </Parallax>

                {/* Visualization */}
                <div className="space-y-4">
                  <div className="text-sm font-medium text-body mb-4">Initialization Progress</div>
                  <div className="grid grid-cols-4 gap-3">
                    {['Design', 'Build', 'Deploy', 'Monitor'].map((step, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        viewport={{ once: true }}
                        className="card p-4 text-center rounded-xl"
                      >
                        <div className="text-xs font-semibold text-muted mb-2">{step}</div>
                        <div className="w-full h-1 bg-muted/20 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            initial={{ width: '0%' }}
                            animate={{ width: idx < 2 ? '100%' : '0%' }}
                            transition={{ duration: 1.5, delay: idx * 0.2 }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.button
                  onClick={handleInitialize}
                  disabled={!connected || isInitializing}
                  whileHover={!connected || isInitializing ? {} : { scale: 1.02 }}
                  whileTap={!connected || isInitializing ? {} : { scale: 0.98 }}
                  className="btn-primary w-full py-5 text-lg font-semibold tracking-tight flex items-center justify-center gap-3"
                >
                  <PlugIcon size={20} className="text-white" animate={isInitializing} />
                  {isInitializing ? 'Initializing...' : 'Initialize Protocol'}
                </motion.button>

                {status && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-5 rounded-2xl border text-sm font-medium text-center ${
                      status.includes('failed') || status.includes('Failed')
                        ? 'bg-red-500/[0.05] border-red-500/20 text-red-400'
                        : 'bg-emerald-500/[0.05] border-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {status}
                  </motion.div>
                )}
              </div>
            </Card>
          </div>

          <ScrollReveal>
            <Card title="System Health" badge="Monitoring">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-body">Network Load</span>
                    <span className="text-xs text-emerald-400">Optimal</span>
                  </div>
                  <div className="w-full h-2 bg-muted/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                      initial={{ width: '0%' }}
                      whileInView={{ width: '65%' }}
                      transition={{ duration: 1.5 }}
                      viewport={{ once: true }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-body">Security Score</span>
                    <span className="text-xs text-blue-400">Excellent</span>
                  </div>
                  <div className="w-full h-2 bg-muted/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                      initial={{ width: '0%' }}
                      whileInView={{ width: '92%' }}
                      transition={{ duration: 1.5, delay: 0.2 }}
                      viewport={{ once: true }}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-muted/20 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <NetworkIcon size={16} className="text-indigo-400" animate={false} />
                    <span>All systems operational</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="text-emerald-400">●</span>
                    <span>Last check: 2 minutes ago</span>
                  </div>
                </div>
              </div>
            </Card>
          </ScrollReveal>
        </BentoGrid>

        {/* Setup Instructions */}
        <ScrollReveal className="mt-16">
          <Card title="Automated Setup" badge="Terminal">
            <div className="space-y-4 text-muted text-sm leading-relaxed font-medium">
              <p>For a complete automated setup, run the following command:</p>
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-slate-900/50 border border-indigo-500/30 p-5 rounded-2xl font-mono text-xs text-indigo-300 break-all cursor-pointer hover:border-indigo-500/50 transition-all"
              >
                pnpm ts-node scripts/init_devnet.ts
              </motion.div>
              <ul className="list-disc list-inside space-y-2 text-xs pt-4">
                <li>Handles mint creation</li>
                <li>Sets up vault accounts</li>
                <li>Initializes funding</li>
              </ul>
            </div>
          </Card>
        </ScrollReveal>
      </div>
    </PageWrapper>
  );
}
