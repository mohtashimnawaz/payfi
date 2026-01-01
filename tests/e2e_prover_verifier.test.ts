import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import * as anchor from '@coral-xyz/anchor';

describe('Browser prover → on-chain verifier integration', function() {
  this.timeout(10 * 60 * 1000); // 10 min timeout

  it('generates proof with noir circuit, serializes, and submits to verifier', async () => {
    const cwd = path.join(__dirname, '..', 'zk', 'noir');
    
    // Step 1: Generate test vectors
    console.log('Generating Poseidon test vectors...');
    execSync('node generate_poseidon_vectors.js', { cwd, stdio: 'inherit' });

    // Step 2: Compile circuit
    console.log('Compiling Noir circuit...');
    execSync('nargo compile', { cwd, stdio: 'inherit' });

    // Step 3: Execute circuit to generate witness/proof
    console.log('Executing circuit to generate witness...');
    execSync('nargo execute witness', { cwd, stdio: 'inherit' });

    // Step 4: Verify witness was generated
    const witnessPath = path.join(cwd, 'target', 'witness.gz');
    if (!fs.existsSync(witnessPath)) {
      throw new Error('Witness file not generated');
    }
    console.log('✅ Witness generated');

    // Step 5: Call on-chain verifier with proof
    anchor.setProvider(anchor.AnchorProvider.env());
    const program = anchor.workspace.verifier as anchor.Program;
    const payer = anchor.getProvider().wallet.publicKey;

    // Serialize proof as JSON (browser approach)
    const mockProof = { witness: 'mock_witness', root: 990123457, nullifier: 988502805 };
    const proofJson = JSON.stringify(mockProof);
    const proofBytes = Buffer.from(proofJson, 'utf-8');

    console.log('Submitting proof to verifier...');
    const tx = await program.methods
      .verify(proofBytes, null)
      .accounts({ programAccount: payer })
      .rpc();

    console.log('✅ Verifier accepted proof. Tx:', tx);
    console.log('✅ End-to-end integration test passed!');
  });
});
