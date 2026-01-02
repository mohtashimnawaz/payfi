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
    <div>
      <div className="mb-10 animate-fadeInUp">
        <h1 className="text-4xl font-bold mb-3 gradient-text">Debug Console</h1>
        <p className="text-slate-400">View on-chain protocol state and account debugging.</p>
      </div>
      <BentoGrid>
        <div className="lg:col-span-3">
          <Card title="On-chain Vault State">
            <div className="space-y-4">
              <button 
                onClick={fetchState}
                className="btn-secondary w-full py-2 font-medium"
              >
                🔄 Refresh State
              </button>
              <div className="bg-slate-900/70 rounded-lg p-4 border border-slate-700/50 overflow-x-auto max-h-96 overflow-y-auto">
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap break-words">
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
