import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('Noir Poseidon build & prove', function () {
  this.timeout(5 * 60 * 1000); // allow up to 5 minutes for compile

  it('builds wasm and produces proof_poseidon.json', () => {
    const cwd = path.join(__dirname, '..', 'zk', 'noir');
    // Clean target
    try { execSync('make clean', { cwd, stdio: 'inherit' }); } catch (e) {}

    // Build poseidon circuit (requires `noirc` in PATH)
    execSync('make build-poseidon', { cwd, stdio: 'inherit' });

    // Prove (requires input.poseidon.example.json to be present)
    execSync('make prove-poseidon', { cwd, stdio: 'inherit' });

    const proofPath = path.join(cwd, 'proof_poseidon.json');
    const exists = fs.existsSync(proofPath);
    if (!exists) {
      throw new Error('proof_poseidon.json not found; build or prove likely failed');
    }
    const proof = JSON.parse(fs.readFileSync(proofPath, 'utf8'));
    if (!proof) throw new Error('proof_poseidon.json is empty or invalid JSON');
  });
});
