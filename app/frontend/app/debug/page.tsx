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
      <h1>Debug</h1>
      <BentoGrid>
        <Card title="On-chain state">
          <pre style={{whiteSpace: 'pre-wrap'}}>{JSON.stringify(info, null, 2)}</pre>
        </Card>
      </BentoGrid>
    </div>
  );
}
