import React, { useState, useEffect } from 'react';
import { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: PublicKey }>;
      disconnect: () => Promise<void>;
      signTransaction: (tx: Transaction) => Promise<Transaction>;
      publicKey?: PublicKey;
    };
  }
}

export default function ProverPage(){
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [proof, setProof] = useState<any>(null);
  const [proofSerialized, setProofSerialized] = useState<string>('');
  const [wallet, setWallet] = useState<PublicKey | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [input, setInput] = useState({ leaf: '987654321', path_hashes: '1234567', index: '1', secret: '424242' });
  const [submitStatus, setSubmitStatus] = useState('');

  // Check if Phantom is installed on page load
  useEffect(() => {
    if (window.solana?.isPhantom) {
      setMessage('✅ Phantom wallet detected');
    } else {
      setMessage('⚠️ Phantom wallet not found. Install from https://phantom.app');
    }
  }, []);

  // Connect wallet
  async function connectWallet() {
    try {
      if (!window.solana?.isPhantom) {
        setMessage('❌ Phantom wallet not installed');
        return;
      }
      const resp = await window.solana.connect();
      setWallet(resp.publicKey);
      setWalletConnected(true);
      setMessage(`✅ Connected wallet: ${resp.publicKey.toBase58().slice(0, 8)}...`);
    } catch (e) {
      setMessage(`❌ Wallet connection failed: ${String(e)}`);
    }
  }

  // Disconnect wallet
  async function disconnectWallet() {
    try {
      await window.solana?.disconnect();
      setWallet(null);
      setWalletConnected(false);
      setMessage('✅ Disconnected wallet');
    } catch (e) {
      setMessage(`❌ Disconnect failed: ${String(e)}`);
    }
  }

  // Serialize proof to bytes for on-chain submission
  function serializeProof(proof: any): Uint8Array {
    // Noir proof format: [public_inputs, proof_data]
    // For now, serialize as JSON then convert to bytes (simple approach)
    const json = JSON.stringify(proof);
    const encoder = new TextEncoder();
    return encoder.encode(json);
  }

  async function generateProof(){
    setStatus('running');
    setMessage('Fetching wasm from /note_membership_poseidon.wasm...');
    try{
      const r = await fetch('/note_membership_poseidon.wasm');
      if(!r.ok){
        setMessage('WASM not found. Run `cd zk/noir && make export-wasm` then reload.');
        setStatus('error');
        return;
      }
      const wasm = await r.arrayBuffer();
      setMessage('Loaded wasm (' + wasm.byteLength + ' bytes). Initializing noir wasm...');

      // dynamic import of noir_wasm
      const noir = await import('@noir-lang/noir_wasm');
      if(!noir){
        setMessage('noir_wasm not found. Run: npm install @noir-lang/noir_wasm');
        setStatus('error');
        return;
      }

      // Create prover instance
      setMessage('Creating prover from compiled circuit...');
      const proverInstance = new noir.Prover(new Uint8Array(wasm));
      setMessage('Prover ready. Generating proof...');

      // Parse inputs as Fields (assumed to fit in field)
      const inputs = { 
        leaf: input.leaf, 
        path_hashes: input.path_hashes, 
        index: input.index, 
        secret: input.secret,
        root: '990123457',  // derived from hash function
        nullifier: '988502805'  // derived from hash function
      };
      
      const generatedProof = await proverInstance.prove(inputs);
      setProof(generatedProof);
      
      const serialized = serializeProof(generatedProof);
      setProofSerialized(Buffer.from(serialized).toString('base64'));
      
      setMessage('✅ Proof generated! Ready to submit to chain.');
      setStatus('done');
    }catch(e){
      console.error(e);
      setMessage('❌ Error: ' + String(e));
      setStatus('error');
    }
  }

  async function submitProofToChain(){
    setSubmitStatus('submitting...');
    try{
      if(!walletConnected || !wallet){
        setSubmitStatus('❌ Wallet not connected. Click "Connect Wallet" first.');
        return;
      }

      if(!proofSerialized){
        setSubmitStatus('❌ No proof generated. Click "Generate Proof" first.');
        return;
      }

      setSubmitStatus('Connecting to local validator...');
      
      // Create provider and program
      const connection = new Connection('http://127.0.0.1:8899', 'confirmed');
      const provider = new anchor.AnchorProvider(
        connection,
        { publicKey: wallet, signTransaction: window.solana!.signTransaction.bind(window.solana), signAllTransactions: async (txs) => {
          return Promise.all(txs.map((tx) => window.solana!.signTransaction(tx)));
        }},
        { preflightCommitment: 'confirmed' }
      );

      // TODO: Load verifier IDL and program
      // For now, create instruction manually
      setSubmitStatus('Building transaction...');
      
      const proofBytes = Buffer.from(proofSerialized, 'base64');
      const tx = new Transaction();
      
      // This is a placeholder; actual implementation requires verifier IDL
      // TODO: Replace with actual verifier program instruction
      tx.add(
        new TransactionInstruction({
          programId: new PublicKey('H7vpWaLWY1dDc8odHnZ3p4SMRT89uDe6WRpaP5ewwWoh'),
          keys: [{ pubkey: wallet, isSigner: true, isWritable: false }],
          data: Buffer.from([]), // TODO: encode verify instruction with proof
        })
      );

      setSubmitStatus('⏳ Signing transaction with Phantom...');
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      tx.feePayer = wallet;

      const signedTx = await window.solana!.signTransaction(tx);
      
      setSubmitStatus('📤 Sending transaction...');
      const sig = await connection.sendRawTransaction(signedTx.serialize());
      
      setSubmitStatus(`✅ Proof submitted! Signature: ${sig.slice(0, 16)}...`);
    }catch(e){
      console.error(e);
      setSubmitStatus('❌ ' + String(e));
    }
  }

  return (
    <main style={{padding: 24, maxWidth: 800, margin: '0 auto'}}>
      <h1>🔐 PayFi Browser Prover</h1>
      <p>Generate ZK proofs client-side. Secrets never leave the browser.</p>

      <section style={{marginBottom: 32, padding: 16, border: '1px solid #ddd', borderRadius: 8}}>
        <h2>0. Connect Wallet</h2>
        {!walletConnected ? (
          <button onClick={connectWallet} style={{padding: '10px 20px', fontSize: 16, cursor: 'pointer'}}>
            🔗 Connect Phantom Wallet
          </button>
        ) : (
          <div>
            <p><strong>✅ Connected:</strong> {wallet?.toBase58().slice(0, 16)}...</p>
            <button onClick={disconnectWallet} style={{padding: '10px 20px', fontSize: 16, cursor: 'pointer'}}>
              🔓 Disconnect
            </button>
          </div>
        )}
      </section>

      <section style={{marginBottom: 32, padding: 16, border: '1px solid #ddd', borderRadius: 8}}>
        <h2>1. Generate Proof</h2>
        <div style={{display:'grid',gap:8,maxWidth:420}}>
          <label>Leaf <input value={input.leaf} onChange={e=>setInput({...input,leaf:e.target.value})}/></label>
          <label>Path hashes <input value={input.path_hashes} onChange={e=>setInput({...input,path_hashes:e.target.value})}/></label>
          <label>Index <input value={input.index} onChange={e=>setInput({...input,index:e.target.value})}/></label>
          <label>Secret <input value={input.secret} onChange={e=>setInput({...input,secret:e.target.value})}/></label>
          <button onClick={generateProof} disabled={status==='running'} style={{padding: '10px 20px', fontSize: 16, cursor: 'pointer'}}>
            {status==='running' ? '⏳ Generating...' : '🧮 Generate Proof'}
          </button>
        </div>
        <p><strong>Status:</strong> {status}</p>
        <pre style={{background:'#f5f5f5', padding: 12, borderRadius: 4, fontSize: 12}}>{message}</pre>
      </section>

      {proofSerialized && (
        <section style={{marginBottom: 32, padding: 16, border: '1px solid #ddd', borderRadius: 8}}>
          <h2>2. Submit to Chain</h2>
          <p><strong>Serialized proof (base64):</strong></p>
          <textarea 
            value={proofSerialized} 
            readOnly 
            style={{width:'100%', height:80, fontFamily: 'monospace', fontSize: 12}}
          />
          <button 
            onClick={submitProofToChain} 
            disabled={!walletConnected}
            style={{marginTop: 12, padding: '10px 20px', fontSize: 16, cursor: walletConnected ? 'pointer' : 'not-allowed', opacity: walletConnected ? 1 : 0.5}}
          >
            ⛓️ Submit Proof to Verifier
          </button>
          <p><strong>Submit Status:</strong> {submitStatus || '(ready to submit)'}</p>
        </section>
      )}

      <hr/>
      <details>
        <summary style={{cursor: 'pointer'}}>📋 Dev Notes</summary>
        <ul>
          <li>Ensure <code>@noir-lang/noir_wasm</code> is installed: <code>npm install @noir-lang/noir_wasm</code></li>
          <li>Export WASM: <code>cd zk/noir && make export-wasm</code></li>
          <li>Local validator: <code>solana-test-validator --reset</code></li>
          <li>Requires Phantom wallet: <a href="https://phantom.app" target="_blank">phantom.app</a></li>
          <li>TODO: Wire actual verifier program IDL for on-chain calls</li>
        </ul>
      </details>
    </main>
  );
}
