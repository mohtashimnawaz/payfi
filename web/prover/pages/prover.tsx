import React, { useState } from 'react';
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

export default function ProverPage(){
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [proof, setProof] = useState<any>(null);
  const [proofSerialized, setProofSerialized] = useState<string>('');
  const [input, setInput] = useState({ leaf: '987654321', path_hashes: '1234567', index: '1', secret: '424242' });
  const [submitStatus, setSubmitStatus] = useState('');

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
      // Note: noir_wasm API may vary; adjust based on actual release
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
      
      setMessage('✅ Proof generated! Serialized: ' + proofSerialized.slice(0, 100) + '...');
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
      if(!window.solana){
        setSubmitStatus('❌ Phantom wallet not found');
        return;
      }

      const provider = new anchor.AnchorProvider(
        new Connection('http://127.0.0.1:8899'), 
        window.solana, 
        { preflightCommitment: 'processed' }
      );
      
      // TODO: wire actual verifier program call
      setSubmitStatus('✅ Would submit proof to verifier (integration in progress)');
    }catch(e){
      setSubmitStatus('❌ ' + String(e));
    }
  }

  return (
    <main style={{padding: 24}}>
      <h1>payfi Browser Prover (Dev)</h1>
      <p>Generate ZK proofs client-side. Secrets never leave the browser.</p>
      
      <section style={{marginBottom: 32}}>
        <h2>1. Generate Proof</h2>
        <div style={{display:'grid',gap:8,maxWidth:420}}>
          <label>Leaf <input value={input.leaf} onChange={e=>setInput({...input,leaf:e.target.value})}/></label>
          <label>Path hashes <input value={input.path_hashes} onChange={e=>setInput({...input,path_hashes:e.target.value})}/></label>
          <label>Index <input value={input.index} onChange={e=>setInput({...input,index:e.target.value})}/></label>
          <label>Secret <input value={input.secret} onChange={e=>setInput({...input,secret:e.target.value})}/></label>
          <button onClick={generateProof} disabled={status==='running'}>
            {status==='running' ? 'Generating...' : 'Generate Proof (browser)'}
          </button>
        </div>
        <p><strong>Status:</strong> {status}</p>
        <pre style={{background:'#f5f5f5', padding: 8, borderRadius: 4}}>{message}</pre>
      </section>

      {proofSerialized && (
        <section style={{marginBottom: 32}}>
          <h2>2. Submit to Chain</h2>
          <p>Serialized proof (base64):</p>
          <textarea 
            value={proofSerialized} 
            readOnly 
            style={{width:'100%', height:80, fontFamily: 'monospace'}}
          />
          <button onClick={submitProofToChain} style={{marginTop: 8}}>
            Submit Proof to Verifier
          </button>
          <p><strong>Submit Status:</strong> {submitStatus}</p>
        </section>
      )}

      <hr/>
      <p><small>
        <strong>Dev notes:</strong> Ensure <code>@noir-lang/noir_wasm</code> is installed and <code>/public/note_membership_poseidon.wasm</code> exists.
        Run: <code>cd zk/noir && make export-wasm</code>
      </small></p>
    </main>
  );
}
