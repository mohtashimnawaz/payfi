const fs = require('fs');
const path = require('path');
const src = path.join(__dirname,'..','..','zk','noir','target','wasm32-wasi','release','note_membership_poseidon.wasm');
const dest = path.join(__dirname,'..','public','note_membership_poseidon.wasm');

if (!fs.existsSync(src)){
  console.error('WASM not found at', src);
  console.error('Run `cd zk/noir && make build-poseidon && make export-wasm` first.');
  process.exit(1);
}

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
console.log('Copied wasm to', dest);
