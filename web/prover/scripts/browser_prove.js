// Minimal Node-side simulation of browser prover using `@noir-lang/noir_wasm` bindings
// This script requires `@noir-lang/noir_wasm` to be installed.

const fs = require('fs');
const path = require('path');

(async function(){
  let noir_wasm;
  try {
    noir_wasm = require('@noir-lang/noir_wasm');
  } catch(e){
    console.error('Please install @noir-lang/noir_wasm in web/prover with `npm i`');
    process.exit(1);
  }

  const wasmPath = path.join(__dirname,'..','public','note_membership_poseidon.wasm');
  if(!fs.existsSync(wasmPath)){
    console.error('WASM not found at', wasmPath, 'run `npm run copy-wasm` first');
    process.exit(1);
  }

  const wasm = fs.readFileSync(wasmPath);
  console.log('Loaded wasm bytes, length', wasm.length);

  // The exact API depends on noir_wasm version; here's a best-effort sketch
  try{
    const prover = await noir_wasm.Prover.new(wasm);
    // Example witness input; adjust to match input.poseidon.example.json
    const input = { leaf: 987654321, path_hashes: 1234567, index: 1, root: 0, nullifier: 0, secret: 424242 };
    const proof = await prover.prove(input);
    console.log('Produced proof (truncated):', JSON.stringify(proof).slice(0,200));
  }catch(err){
    console.error('Browser/noir_wasm prove API failed or differs on this version. See README for correct bindings usage.', err);
    process.exit(1);
  }
})();
