// Generate test vectors for the Poseidon-based circuit using circomlibjs poseidon
// This script will compute the root and nullifier for example inputs and write them
// into `input.poseidon.example.json` so proofs can be generated deterministically.

const fs = require('fs');
const path = require('path');
(async function(){
  let poseidon;
  try {
    // circomlibjs exports a poseidon function
    const circomlib = await import('circomlibjs');
    poseidon = circomlib.poseidon;
  } catch (e) {
    console.error('circomlibjs is required to generate vectors. Install with `npm i circomlibjs` in the project root or web/prover folder.');
    process.exit(1);
  }

  const leaf = BigInt(987654321);
  const path_hashes = BigInt(1234567);
  const index = BigInt(1);
  const secret = BigInt(424242);

  // poseidon takes an array and returns a BigInt-like field element (as BigInt or BN)
  const h1 = poseidon([leaf, path_hashes]);
  const root = poseidon([h1, index]);
  const nullifier = poseidon([leaf, secret]);

  const out = {
    leaf: Number(leaf.toString()),
    path_hashes: Number(path_hashes.toString()),
    index: Number(index.toString()),
    root: Number(root.toString()),
    nullifier: Number(nullifier.toString()),
    secret: Number(secret.toString())
  };

  // Also write a small unit test input that asserts poseidon([a,b]) == expected
  const unitExpected = Number(poseidon([BigInt(12345), BigInt(67890)]).toString());
  const unitInput = { a: 12345, b: 67890, expected: unitExpected };
  fs.writeFileSync(path.join(__dirname,'input.poseidon.unit.json'), JSON.stringify(unitInput, null, 2));
  console.log('Wrote poseidon unit test input to', path.join(__dirname,'input.poseidon.unit.json'));

  const outPath = path.join(__dirname,'input.poseidon.example.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log('Wrote test vectors to', outPath);
})();
