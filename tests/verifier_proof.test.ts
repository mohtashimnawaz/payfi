import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import * as anchor from '@coral-xyz/anchor';

describe('verifier proof format check', function(){
  this.timeout(5*60*1000);

  it('builds and packs a proof, then calls verifier.verify with it', async ()=>{
    const cwd = path.join(__dirname,'..','zk','noir');
    // generate vectors
    execSync('node generate_poseidon_vectors.js', { cwd, stdio: 'inherit' });
    // build and prove
    execSync('make build-poseidon', { cwd, stdio: 'inherit' });
    execSync('make prove-poseidon', { cwd, stdio: 'inherit' });
    // pack
    execSync('node pack_proof.js', { cwd, stdio: 'inherit' });

    const packed = fs.readFileSync(path.join(cwd,'proof_poseidon.bin'));

    // Call verifier program with proof as bytes
    anchor.setProvider(anchor.AnchorProvider.env());
    const program = anchor.workspace.verifier as anchor.Program;
    const payer = anchor.getProvider().wallet.publicKey;

    // send tx
    await program.methods.verify(packed, null).accounts({programAccount: payer}).rpc();
  });
});
