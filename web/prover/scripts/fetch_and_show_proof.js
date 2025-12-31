const fs = require('fs');
const path = require('path');

// Simple script to demonstrate proof artifact presence and print basic info
// Browser integration will require `noir_wasm` bindings; this script is for dev/demo.

const proofPath = path.join(__dirname, '..', '..', 'zk', 'noir', 'proof_poseidon.json');
if (!fs.existsSync(proofPath)) {
  console.error('proof_poseidon.json not found. Run `cd zk/noir && make prove-poseidon` first.');
  process.exit(1);
}
const proof = JSON.parse(fs.readFileSync(proofPath));
console.log('Proof loaded. Estimated proof JSON size:', Buffer.byteLength(JSON.stringify(proof)) , 'bytes');
console.log('\n(For browser prover: load `target/wasm32-wasi/release/note_membership_poseidon.wasm` via WebAssembly and use noir wasm prover bindings to create proofs client-side.)');
