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
      const vaultState = await (program.account as any).vault.fetch(vaultPda);
      setInfo({ vaultState });
    }catch(err){
      setInfo({ error: String(err) });
    }
  }

  useEffect(()=>{ fetchState(); }, [connected]);

  return (
    <div className="reveal">
      <div className="mb-16">
        <h1 className="text-5xl font-semibold text-body mb-6 tracking-tighter">Debug <span className="prism-text">Console</span></h1>
        <p className="text-muted text-xl max-w-2xl font-medium leading-relaxed">View on-chain protocol state and account debugging.</p>
      </div>
      
      <BentoGrid>
        <div className="lg:col-span-3">
          <Card title="On-chain Vault State" badge="Developer">
            <div className="space-y-8">
              <button 
                onClick={fetchState}
                className="w-full bg-transparent hover:bg-[#f2f4f7] text-body py-4 rounded-2xl font-semibold transition-all border border-[#e6e9ef]"
              >
                Refresh State
              </button>
              <div className="bg-transparent p-8 rounded-3xl border border-[#e6e9ef] overflow-x-auto max-h-[600px] overflow-y-auto">
                <pre className="text-xs font-mono text-muted whitespace-pre-wrap break-words leading-relaxed">
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
