"use client";
import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { getConnection, getAnchorProvider, getProgram } from '../../src/lib/anchor';
import BentoGrid from '../../src/components/BentoGrid';
import Card from '../../src/components/Card';
import FloatingInput from '../../src/components/FloatingInput';
import TransactionStepper from '../../src/components/TransactionStepper';
import PageWrapper from '../../src/components/PageWrapper';
import { ScrollReveal, Parallax } from '../../src/components/ScrollAnimations';
import { ComparisonBar } from '../../src/components/DataVisualization';
import { NetworkIcon, PlugIcon, LinkIcon } from '../../src/components/AnimatedIcons';
import { motion } from 'framer-motion';

export default function RelayerPage() {
  const { publicKey, wallet, connected } = useWallet();
  const [status, setStatus] = useState<string | null>(null);
  const [relayerAddr, setRelayerAddr] = useState<string>('');
  const [limit, setLimit] = useState<number>(1);
  const [windowSec, setWindowSec] = useState<number>(60);
  const [relayerStateInfo, setRelayerStateInfo] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { id: 'register', label: 'Register', status: 'pending' as const, icon: LinkIcon },
    { id: 'init', label: 'Initialize', status: 'pending' as const, icon: PlugIcon },
    { id: 'verify', label: 'Verify', status: 'pending' as const, icon: NetworkIcon },
    { id: 'complete', label: 'Complete', status: 'pending' as const, icon: PlugIcon },
  ];

  async function handleAddRelayer() {
    if (!publicKey || !wallet) {
      setStatus('Connect wallet');
      return;
    }
    
    setIsProcessing(true);
    setCurrentStep(0);
    
    try {
      setStatus('Registering relayer...');
      setCurrentStep(1);
      
      const connection = getConnection();
      const provider = getAnchorProvider(connection, (wallet as any));
      const program = getProgram(provider);
      const [adminPda] = await PublicKey.findProgramAddress([Buffer.from('admin')], program.programId);
      const relayerPub = new PublicKey(relayerAddr);

      setCurrentStep(2);
      await (program as any).methods
        .addRelayer(relayerPub)
        .accounts({ admin: adminPda, payer: publicKey })
        .rpc();

      setCurrentStep(3);
      setStatus('Relayer registered successfully');
      setTimeout(() => setStatus(null), 3000);
    } catch (err: any) {
      setStatus('Failed to add relayer: ' + (err.message || String(err)));
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleInitRelayerState() {
    if (!publicKey || !wallet) {
      setStatus('Connect wallet');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      setStatus('Initializing relayer state...');
      const connection = getConnection();
      const provider = getAnchorProvider(connection, (wallet as any));
      const program = getProgram(provider);
      const relayerPub = new PublicKey(relayerAddr);
      const [relayerStatePda] = await PublicKey.findProgramAddress([Buffer.from('relayer_state'), relayerPub.toBuffer()], program.programId);

      await (program as any).methods
        .initRelayerState(relayerPub, new anchor.BN(limit), new anchor.BN(windowSec))
        .accounts({ relayerState: relayerStatePda, payer: publicKey, systemProgram: SystemProgram.programId })
        .rpc();

      setStatus('Relayer state initialized');
      setTimeout(() => setStatus(null), 3000);
    } catch (err: any) {
      setStatus('Init relayer state failed: ' + (err.message || String(err)));
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  }

  async function fetchRelayerState() {
    if (!relayerAddr) {
      setStatus('Enter relayer pubkey first');
      return;
    }
    
    try {
      setStatus('Fetching relayer state...');
      const connection = getConnection();
      const provider = getAnchorProvider(connection, { publicKey: PublicKey.default } as any);
      const program = getProgram(provider);
      const relayerPub = new PublicKey(relayerAddr);
      const [relayerStatePda] = await PublicKey.findProgramAddress([Buffer.from('relayer_state'), relayerPub.toBuffer()], program.programId);
      const info = await (program.account as any).relayerState.fetchNullable(relayerStatePda);
      setRelayerStateInfo(info);
      setStatus('Fetched relayer state');
      setTimeout(() => setStatus(null), 3000);
    } catch (err: any) {
      setStatus('Fetch failed: ' + (err.message || String(err)));
      console.error(err);
    }
  }

  return (
    <PageWrapper>
      <div className="reveal">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-20">
          <h1 className="text-6xl font-bold text-body mb-6 tracking-tighter">
            Relayer <span className="prism-text">Network</span>
          </h1>
          <p className="text-muted text-xl max-w-2xl font-medium leading-relaxed">
            Register and manage relayers for secure transaction processing and cryptographic attestation.
          </p>
        </motion.div>

        {/* Network Status */}
        <ScrollReveal className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Active Relayers', value: '12', icon: NetworkIcon, color: 'text-indigo-400' },
              { label: 'Network Health', value: '98.5%', icon: PlugIcon, color: 'text-emerald-400' },
              { label: 'Avg Response', value: '245ms', icon: LinkIcon, color: 'text-purple-400' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="card p-6 rounded-2xl h-full hover:depth-2 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted text-sm font-medium">{stat.label}</span>
                    <stat.icon size={24} className={stat.color} animate={false} />
                  </div>
                  <div className="text-3xl font-bold text-body">{stat.value}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* Stepper */}
        <ScrollReveal className="mb-16">
          <div className="card p-8 rounded-3xl">
            <TransactionStepper currentStep={currentStep} steps={steps} />
          </div>
        </ScrollReveal>

        <BentoGrid>
          <div className="lg:col-span-2">
            <Card title="Add Relayer" badge="Registry">
              <div className="space-y-8">
                <Parallax offset={20}>
                  <div className="bg-gradient-to-br from-blue-500/[0.05] to-indigo-500/[0.05] p-8 rounded-3xl border border-blue-500/20 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <NetworkIcon size={20} className="text-blue-400" />
                      <div className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold">Status</div>
                    </div>
                    <div className={`text-2xl font-semibold tracking-tight ${connected ? 'text-emerald-400' : 'text-red-400'}`}>
                      {connected ? 'Ready to Register' : 'Connect Wallet'}
                    </div>
                  </div>
                </Parallax>

                <FloatingInput
                  label="Relayer Address (Pubkey)"
                  type="text"
                  value={relayerAddr}
                  onChange={(e) => setRelayerAddr(e.target.value)}
                  placeholder="Enter public key"
                />

                <motion.button
                  onClick={handleAddRelayer}
                  disabled={!connected || !relayerAddr || isProcessing}
                  whileHover={!connected || !relayerAddr || isProcessing ? {} : { scale: 1.02 }}
                  whileTap={!connected || !relayerAddr || isProcessing ? {} : { scale: 0.98 }}
                  className="btn-primary w-full py-5 text-lg font-semibold tracking-tight flex items-center justify-center gap-3"
                >
                  <LinkIcon size={20} className="text-white" animate={isProcessing} />
                  {isProcessing ? 'Registering...' : 'Add Relayer'}
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
            <Card title="Initialize State" badge="Config">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold ml-1">Withdrawal Limit</label>
                  <input
                    type="number"
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value))}
                    className="w-full bg-transparent border border-indigo-500/20 rounded-2xl px-6 py-3 text-body focus:outline-none focus:border-indigo-500/50 transition-colors font-medium text-sm"
                    placeholder="1"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold ml-1">Rate Limit Window (sec)</label>
                  <input
                    type="number"
                    value={windowSec}
                    onChange={(e) => setWindowSec(parseInt(e.target.value))}
                    className="w-full bg-transparent border border-purple-500/20 rounded-2xl px-6 py-3 text-body focus:outline-none focus:border-purple-500/50 transition-colors font-medium text-sm"
                    placeholder="60"
                  />
                </div>

                <motion.button
                  onClick={handleInitRelayerState}
                  disabled={!connected || isProcessing}
                  whileHover={!connected || isProcessing ? {} : { scale: 1.02 }}
                  whileTap={!connected || isProcessing ? {} : { scale: 0.98 }}
                  className="w-full btn-secondary py-4 font-semibold text-sm"
                >
                  {isProcessing ? 'Initializing...' : 'Initialize State'}
                </motion.button>
              </div>
            </Card>
          </ScrollReveal>

          <ScrollReveal>
            <Card title="Relayer State" badge="Viewer">
              <div className="space-y-4">
                <motion.button
                  onClick={fetchRelayerState}
                  disabled={!relayerAddr}
                  whileHover={!relayerAddr ? {} : { scale: 1.02 }}
                  whileTap={!relayerAddr ? {} : { scale: 0.98 }}
                  className="w-full btn-secondary py-3 font-semibold text-sm"
                >
                  Fetch State
                </motion.button>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="card p-4 rounded-2xl overflow-x-auto max-h-56 bg-slate-900/30 border-indigo-500/20"
                >
                  <pre className="text-[11px] font-mono text-indigo-300/80 whitespace-pre-wrap break-words leading-relaxed">
                    {relayerStateInfo ? JSON.stringify(relayerStateInfo, null, 2) : 'No data loaded.'}
                  </pre>
                </motion.div>
              </div>
            </Card>
          </ScrollReveal>
        </BentoGrid>

        {/* Rate Limit Visualization */}
        <ScrollReveal className="mt-16">
          <Card title="Rate Limit Configuration" badge="Analytics">
            <div className="space-y-6">
              <p className="text-sm text-muted">Current rate limiting parameters and their visualization:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-body">Withdrawal Limit</span>
                    <span className="text-xs text-indigo-400 font-semibold">{limit} tx/window</span>
                  </div>
                  <ComparisonBar label1={`Limit: ${limit}`} value1={limit} label2="Used: 0" value2={0} height={6} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-body">Time Window</span>
                    <span className="text-xs text-purple-400 font-semibold">{windowSec}s</span>
                  </div>
                  <ComparisonBar label1={`Window: ${windowSec}s`} value1={windowSec} label2="Elapsed: 0s" value2={0} height={6} />
                </div>
              </div>
            </div>
          </Card>
        </ScrollReveal>
      </div>
    </PageWrapper>
  );
}

