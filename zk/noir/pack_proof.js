// Pack a JSON proof into a binary format with a dev prefix so on-chain verifier can do a simple format check
// Format: 'POS!' (4 bytes) + JSON proof bytes

const fs = require('fs');
const path = require('path');
const inPath = path.join(__dirname, 'proof_poseidon.json');
const outPath = path.join(__dirname, 'proof_poseidon.bin');
if (!fs.existsSync(inPath)) {
  console.error('proof_poseidon.json not found; run `make prove-poseidon` first');
  process.exit(2);
}
const json = fs.readFileSync(inPath);
const header = Buffer.from('POS!');
const buf = Buffer.concat([header, json]);
fs.writeFileSync(outPath, buf);
console.log('Wrote packed proof to', outPath, 'size', buf.length);
