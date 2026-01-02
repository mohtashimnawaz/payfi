"use client";
import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getConnection, getAnchorProvider, getProgram } from '../../src/lib/anchor';
import BentoGrid from '../../src/components/BentoGrid';
import Card from '../../src/components/Card';

export default function DebugPage(){
  const { publicKey, wallet, connected } = useWallet();
  const [info, setInfo] = useState<any>(null);

  async function fetchState(){
    const connection = getConnection();
    try{
      const provider = getAnchorProvider(connection, (wallet as any));
      const program = getProgram(provider);
      const [vaultPda] = await (window as any).PublicKey.findProgramAddress([Buffer.from('vault')], program.programId);
      const vaultState = await program.account.vault.fetch(vaultPda);
      setInfo({ vaultState });
    }catch(err){
      setInfo({ error: String(err) });
    }
  }

  useEffect(()=>{ fetchState(); }, [connected]);

  return (
    <div className="reveal">
      <div className="mb-12">
        <h1 className="text-4xl font-medium text-white mb-4 tracking-tight">Debug Console</h1>
        <p className="text-white/40 text-lg max-w-2xl">View on-chain protocol state and account debugging.</p>
      </div>
      
      <BentoGrid>
        <div className="lg:col-span-3">
          <Card title="On-chain Vault State" badge="Developer">
            <div className="space-y-6">
              <button 
                onClick={fetchState}
                className="btn-secondary w-full py-3 font-medium"
              >
                Refresh State
              </button>
              <div className="bg-white/[0.02] rounded-2xl p-6 border border-white/[0.05] overflow-x-auto max-h-[500px] overflow-y-auto">
                <pre className="text-xs font-mono text-white/40 whitespace-pre-wrap break-words leading-relaxed">
                  {info ? JSON.stringify(info, null, 2) : 'No data loaded. Click Refresh to fetch.'}
                </pre>
              </div>
            </div>
          </Card>
        </div>
      </BentoGrid>
    </div>
  );
}
