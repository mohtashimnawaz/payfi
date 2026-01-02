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
    <div className="container px-4 py-6 mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-slate-900">Debug Console</h1>
      <BentoGrid>
        <Card title="On-chain State">
          <div className="bg-slate-900 rounded p-4 text-slate-100 text-xs font-mono overflow-x-auto">
            <pre className="whitespace-pre-wrap">{JSON.stringify(info, null, 2)}</pre>
          </div>
        </Card>
      </BentoGrid>
    </div>
  );
}
