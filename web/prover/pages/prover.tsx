import React, { useState } from 'react';

export default function ProverPage(){
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [input, setInput] = useState({ leaf: '987654321', path_hashes: '1234567', index: '1', secret: '424242' });

  async function generateProof(){
    setStatus('running');
    setMessage('Fetching wasm from /note_membership_poseidon.wasm...');
    try{
      const r = await fetch('/note_membership_poseidon.wasm');
      if(!r.ok){
        setMessage('WASM not found. Run `cd zk/noir && make build-poseidon && make export-wasm` then reload.');
        setStatus('error');
        return;
      }
      const wasm = await r.arrayBuffer();
      setMessage('Loaded wasm (' + wasm.byteLength + ' bytes). Initializing noir wasm...');

      // dynamic import of noir_wasm - actual API depends on released package
      const noir = await import('@noir-lang/noir_wasm');
      if(!noir || !noir.Prover){
        setMessage('noir_wasm not found or API mismatch. See README for correct usage.');
        setStatus('error');
        return;
      }

      const prover = await noir.Prover.new(new Uint8Array(wasm));
      setMessage('Prover initialized. Running proof...');

      const parsed = { leaf: Number(input.leaf), path_hashes: Number(input.path_hashes), index: Number(input.index), secret: Number(input.secret) };
      const proof = await prover.prove(parsed);
      setMessage('Produced proof (truncated): ' + JSON.stringify(proof).slice(0,200));
      setStatus('done');
    }catch(e){
      console.error(e);
      setMessage('Error: ' + String(e));
      setStatus('error');
    }
  }

  return (
    <main style={{padding: 24}}>
      <h1>payfi Browser Prover (Dev)</h1>
      <p>Enter private inputs to generate a proof client-side. Secrets never leave the browser.</p>
      <div style={{display:'grid',gap:8,maxWidth:420}}>
        <label>Leaf <input value={input.leaf} onChange={e=>setInput({...input,leaf:e.target.value})}/></label>
        <label>Path hashes <input value={input.path_hashes} onChange={e=>setInput({...input,path_hashes:e.target.value})}/></label>
        <label>Index <input value={input.index} onChange={e=>setInput({...input,index:e.target.value})}/></label>
        <label>Secret <input value={input.secret} onChange={e=>setInput({...input,secret:e.target.value})}/></label>
        <button onClick={generateProof}>Generate Proof (browser)</button>
      </div>
      <hr/>
      <p>Status: <b>{status}</b></p>
      <pre>{message}</pre>
      <p><small>Note: This is a dev integration. Ensure `@noir-lang/noir_wasm` is installed and wasm has been exported to <code>/public/note_membership_poseidon.wasm</code>.</small></p>
    </main>
  );
}
