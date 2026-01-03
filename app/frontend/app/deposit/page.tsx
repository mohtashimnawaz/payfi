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
import { LinkIcon, PenIcon, HourglassIcon, SparkleIcon, CurrencyIcon, GlobeIcon, BoltIcon, WalletIcon, WarningIcon } from '../../src/components/AnimatedIcons';
import { motion } from 'framer-motion';

export default function DepositPage() {
  const { publicKey, wallet, connected } = useWallet();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState<number>(100);
  const [vaultTokenAccount, setVaultTokenAccount] = useState<string | null>(null);
  const [vaultLoading, setVaultLoading] = useState(false);
  const [vaultError, setVaultError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [amountError, setAmountError] = useState<string>('');
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [vaultMint, setVaultMint] = useState<string | null>(null);
  const [userTokenAccount, setUserTokenAccount] = useState<string | null>(null);

  useEffect(() => {
    async function loadVault() {
      if (!connected || !wallet) return;
      
      console.log('[Vault Loader] Starting vault load...', { connected, hasWallet: !!wallet, publicKey: publicKey?.toString() });
      
      setVaultLoading(true);
      setVaultError(null);
      
      try {
        const connection = getConnection();
        console.log('[Vault Loader] Connection established:', connection.rpcEndpoint);
        
        // Extract wallet adapter
        const walletAdapter = (wallet as any).adapter;
        if (!walletAdapter) {
          const error = 'Wallet adapter is null';
          console.error('[Vault Loader] Error:', error);
          setVaultError(error);
          addToast('Wallet adapter not available. Please reconnect your wallet.', 'error');
          setVaultLoading(false);
          return;
        }
        
        const anchorWallet = {
          publicKey: publicKey,
          signTransaction: walletAdapter.signTransaction?.bind(walletAdapter),
          signAllTransactions: walletAdapter.signAllTransactions?.bind(walletAdapter),
        } as any;
        
        console.log('[Vault Loader] Creating provider...');
        const provider = getAnchorProvider(connection, anchorWallet);
        if (!provider || !provider.connection || !provider.wallet) {
          const error = 'Invalid provider';
          console.error('[Vault Loader] Error:', error);
          setVaultError(error);
          setVaultLoading(false);
          return;
        }
        
        console.log('[Vault Loader] Getting program...');
        const program = getProgram(provider);
        
        console.log('[Vault Loader] Fetching vault PDA...');
        const [vaultPda] = await PublicKey.findProgramAddress([Buffer.from('vault')], program.programId);
        console.log('[Vault Loader] Vault PDA:', vaultPda.toString());
        
        console.log('[Vault Loader] Fetching vault state...');
        const vaultState = await (program.account as any).vault.fetch(vaultPda);
        console.log('[Vault Loader] Vault state fetched:', vaultState);
        
        // Extract token account and convert to string (it might be a PublicKey object)
        const tokenAccountRaw = (vaultState as any).tokenAccount ?? (vaultState as any).token_account ?? (vaultState as any).vaultTokenAccount;
        const tokenAccount = tokenAccountRaw?.toString ? tokenAccountRaw.toString() : tokenAccountRaw;
        
        if (!tokenAccount) {
          const error = 'Vault token account not found in vault state';
          console.error('[Vault Loader] Error:', error, vaultState);
          setVaultError(error);
          addToast('Vault token account not configured. Please contact admin.', 'warning');
          setVaultLoading(false);
          return;
        }
        
        console.log('[Vault Loader] Vault loaded successfully:', {
          vaultPda: vaultPda.toString(),
          tokenAccount: tokenAccount,
        });
        
        setVaultTokenAccount(tokenAccount);
        
        // Fetch the vault token account to get its mint
        try {
          const vaultTokenAccountInfo = await connection.getParsedAccountInfo(new PublicKey(tokenAccount));
          if (vaultTokenAccountInfo.value) {
            const mintAddress = (vaultTokenAccountInfo.value.data as any).parsed.info.mint;
            setVaultMint(mintAddress);
            console.log('[Vault Loader] Vault uses mint:', mintAddress);
          }
        } catch (err) {
          console.error('[Vault Loader] Failed to fetch vault mint:', err);
        }
        
        setVaultLoading(false);
        
        // Also load user's token balance
        loadUserBalance(connection, publicKey!);
      } catch (err: any) {
        console.error('[Vault Loader] Failed to load vault:', err);
        const errorMsg = err?.message || 'Unknown error';
        setVaultError(errorMsg);
        addToast(`Failed to load vault: ${errorMsg}`, 'error');
        setVaultLoading(false);
      }
    }
    loadVault();
  }, [connected, wallet, publicKey]);

  const loadUserBalance = async (connection: any, userPublicKey: PublicKey) => {
    setBalanceLoading(true);
    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(userPublicKey, { programId: TOKEN_PROGRAM_ID });
      
      if (tokenAccounts.value.length > 0) {
        // If we know the vault mint, try to find the matching token account
        let matchingAccount = null;
        
        if (vaultMint) {
          matchingAccount = tokenAccounts.value.find(
            (acc: any) => acc.account.data.parsed.info.mint === vaultMint
          );
        } else {
          // If we don't know the vault mint yet, just use the first account
          matchingAccount = tokenAccounts.value[0];
        }
        
        if (matchingAccount) {
          const balance = matchingAccount.account.data.parsed.info.tokenAmount.uiAmount;
          const mint = matchingAccount.account.data.parsed.info.mint;
          setUserBalance(balance);
          setUserTokenAccount(matchingAccount.pubkey.toString());
          console.log('[Balance Loader] User token balance:', balance, 'for mint:', mint, 'account:', matchingAccount.pubkey.toString());
          
          if (vaultMint && mint !== vaultMint) {
            addToast(`Warning: You have tokens for a different mint. Vault requires: ${vaultMint}`, 'warning');
          }
        } else {
          setUserBalance(0);
          setUserTokenAccount(null);
          console.log('[Balance Loader] No matching token account for vault mint:', vaultMint);
          addToast(`You don't have a token account for the required mint: ${vaultMint}`, 'warning');
        }
      } else {
        setUserBalance(0);
        console.log('[Balance Loader] No token accounts found');
        addToast('No token accounts found. Please create a token account first.', 'warning');
      }
    } catch (err) {
      console.error('[Balance Loader] Failed to load balance:', err);
      setUserBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  };

  async function handleDeposit() {
    if (!publicKey || !wallet) {
      addToast('Please connect wallet', 'warning');
      return;
    }

    // Validate vault token account is loaded
    if (!vaultTokenAccount) {
      addToast('Vault not loaded yet. Please wait a moment and try again.', 'warning');
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
    if (userBalance !== null && amount > userBalance) {
      setAmountError(`Insufficient balance. You have ${userBalance} tokens`);
      addToast(`Insufficient balance. You have ${userBalance} tokens available`, 'error');
      return;
    }
    setAmountError('');

    // Extract the adapter from the wallet object (wallet contains { adapter, readyState })
    const walletAdapter = (wallet as any).adapter;
    if (!walletAdapter || typeof walletAdapter.signTransaction !== 'function' || typeof walletAdapter.signAllTransactions !== 'function') {
      console.error('Wallet adapter missing signing methods:', {
        hasAdapter: !!walletAdapter,
        hasSignTransaction: typeof walletAdapter?.signTransaction,
        hasSignAllTransactions: typeof walletAdapter?.signAllTransactions,
        walletKeys: Object.keys(wallet as any),
      });
      addToast('Wallet adapter is not ready. Please disconnect and reconnect your wallet.', 'error');
      return;
    }

    setIsLoading(true);
    setCurrentStep(1); // Sign transaction

    try {
      const connection = getConnection();
      const anchorWallet = {
        publicKey: publicKey,
        signTransaction: walletAdapter.signTransaction.bind(walletAdapter),
        signAllTransactions: walletAdapter.signAllTransactions.bind(walletAdapter),
      } as any;
      const provider = getAnchorProvider(connection, anchorWallet);
      if (!provider || !provider.wallet || !provider.connection) {
        addToast('Wallet provider unavailable — please reconnect your wallet and try again.', 'error');
        setIsLoading(false);
        return;
      }

      let program;
      try {
        program = getProgram(provider);
      } catch (err: any) {
        console.error('Failed to construct program', err);
        addToast('Failed to prepare on-chain program. Make sure your wallet is connected and on the correct network.', 'error');
        setIsLoading(false);
        return;
      }

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

      // If vault mint is known, pick the token account that matches that mint
      let selectedAccount = tokenAccounts.value[0];
      if (vaultMint) {
        const matching = tokenAccounts.value.find((acc: any) => acc.account.data.parsed.info.mint === vaultMint);
        if (!matching) {
          addToast(`No token account found for required mint: ${vaultMint}. Create an associated token account and fund it.`, 'error');
          setIsLoading(false);
          setCurrentStep(0);
          return;
        }
        selectedAccount = matching;
      }

      const from = new PublicKey(selectedAccount.pubkey.toString());
      // save selected user's token account for UI clarity
      setUserTokenAccount(selectedAccount.pubkey.toString());

      await (program as any).methods
        .deposit(new anchor.BN(amount), Buffer.from(commitment), null)
        .accounts({
          user: publicKey,
          from: from,
          admin: adminPda,
          vault: vaultPda,
          vaultTokenAccount: new PublicKey(vaultTokenAccount),
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
        // Reload balance after successful deposit
        if (publicKey) {
          const connection = getConnection();
          loadUserBalance(connection, publicKey);
        }
      }, 2500);
    } catch (err: any) {
      // Catch SendTransactionError and try to log helpful details
      if (err?.getLogs) {
        try {
          const logs = await err.getLogs();
          console.error('[Deposit] Transaction logs:', logs);
        } catch (e) {
          console.error('[Deposit] Failed to get logs from error object', e);
        }
      } else if (err?.transactionLogs) {
        console.error('[Deposit] Transaction logs (from error.transactionLogs):', err.transactionLogs);
      }

      // Parse error for user-friendly message
      let errorMsg = err.message || String(err);
      
      if (errorMsg.includes('insufficient funds') || errorMsg.includes('Error: 0x1')) {
        errorMsg = 'Insufficient token balance. Please fund your account first.';
      } else if (errorMsg.includes('Account not associated with this Mint') || errorMsg.includes('Error: 0x3')) {
        errorMsg = `Wrong token type. Your token account doesn't match the vault's required mint${vaultMint ? ': ' + vaultMint : ''}`;
      } else if (errorMsg.includes('User rejected')) {
        errorMsg = 'Transaction cancelled by user';
      }
      
      addToast(`Deposit failed: ${errorMsg}`, 'error');
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
              icon: <LinkIcon size={20} className="text-white" animate={false} />,
            },
            {
              id: 'sign',
              label: 'Sign TX',
              status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : 'pending',
              icon: <PenIcon size={20} className="text-white" animate={false} />,
            },
            {
              id: 'confirm',
              label: 'Confirming',
              status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'pending',
              icon: <HourglassIcon size={20} className="text-white" animate={false} />,
            },
            {
              id: 'complete',
              label: 'Complete',
              status: currentStep >= 3 ? 'completed' : 'pending',
              icon: <SparkleIcon size={20} className="text-white" animate={false} />,
            },
          ]}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <StatCard label="Deposit Amount" value={amount} suffix=" tokens" color="indigo" icon={<CurrencyIcon size={24} className="text-indigo-400" animate={false} />} />
        <StatCard label="Network" value={1} prefix="Devnet" color="purple" icon={<GlobeIcon size={24} className="text-purple-400" animate={false} />} />
        <StatCard label="Gas Estimate" value={5000} suffix=" SOL" color="pink" icon={<BoltIcon size={24} className="text-pink-400" animate={false} />} />
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
                
                {/* Balance Display */}
                {userBalance !== null && !balanceLoading && (
                  <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 p-6 rounded-xl border border-emerald-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 mb-2 font-bold">Available Balance</div>
                        <div className="text-3xl font-bold text-emerald-300">
                          {userBalance.toLocaleString()} <span className="text-lg text-emerald-400/60">tokens</span>
                        </div>
                        {userTokenAccount && (
                          <div className="mt-2 text-xs text-neutral-400">
                            <div className="font-medium text-emerald-300">Your token account</div>
                            <code className="font-mono text-xs break-all">{userTokenAccount}</code>
                          </div>
                        )}
                      </div>
                      <WalletIcon size={32} className="text-emerald-400/40" animate={false} />
                    </div>
                  </div>
                )}
                
                {balanceLoading && (
                  <div className="bg-neutral-500/10 p-4 rounded-xl border border-neutral-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-neutral-300">Loading balance...</span>
                    </div>
                  </div>
                )}
                
                {vaultLoading && (
                  <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-indigo-300">Loading vault state...</span>
                    </div>
                  </div>
                )}
                
                {vaultError && !vaultLoading && (
                  <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <WarningIcon size={20} className="text-red-400" />
                      <span className="text-sm font-semibold text-red-400">Vault Error</span>
                    </div>
                    <p className="text-xs text-neutral-400 mb-3">{vaultError}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-xs font-medium"
                    >
                      Reload Page
                    </button>
                  </div>
                )}
                
                {vaultTokenAccount && (
                  <div className="bg-transparent p-8 rounded-3xl border border-[#e6e9ef]">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted mb-3 font-bold">Vault Account</div>
                    <code className="text-xs font-mono text-muted break-all leading-relaxed">{vaultTokenAccount}</code>
                  </div>
                )}
                
                {vaultMint && (
                  <div className="bg-indigo-500/5 p-6 rounded-xl border border-indigo-500/10">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 mb-2 font-bold">Required Token Mint</div>
                    <code className="text-xs font-mono text-indigo-300 break-all leading-relaxed">{vaultMint}</code>
                    <p className="text-xs text-neutral-400 mt-3">⚠️ Your token account must have this mint address to deposit</p>
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
                    disabled={!connected || amount <= 0 || vaultLoading || !!vaultError || !vaultTokenAccount}
                    isLoading={isLoading}
                    className="flex-1 text-lg"
                  >
                    {vaultLoading ? 'Loading Vault...' : 'Deposit Tokens'}
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
