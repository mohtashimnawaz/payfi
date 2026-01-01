# Production Roadmap: PayFi ZK Protocol

This document outlines the steps required to transition from development to production-ready implementation.

---

## Overview

The current implementation includes:
- ✅ **Noir 1.0** circuit with ZK proof generation
- ✅ **Anchor program** on Solana for on-chain verification
- ✅ **Browser prover UI** with Phantom wallet integration
- ✅ **Local testing** infrastructure (validator, CI/CD)
- 🟡 **Development verifier** with basic proof format checks
- 🟡 **Placeholder hash** (field arithmetic instead of Poseidon)

---

## 1. Real Poseidon Hash Implementation

### Current Status
- **Circuit file**: [/zk/noir/src/main.nr](../zk/noir/src/main.nr)
- **Issue**: Noir stdlib `poseidon_hash2()` is private in v1.0-beta.17
- **Workaround**: Using field arithmetic `a + b * 2` (NOT cryptographically secure)

### Production Steps

#### Step 1: Monitor Noir Stdlib
Once Noir 1.0 stable releases with public Poseidon, update the circuit:

```rust
// Current (dev):
fn poseidon_hash2(a: Field, b: Field) -> Field {
    a + b * 2  // NOT SECURE - placeholder only
}

// Target (production):
use std::hash::poseidon;

fn poseidon_hash2(a: Field, b: Field) -> Field {
    poseidon::poseidon_hash_2([a, b])
}
```

**Timeline**: Check [Noir GitHub releases](https://github.com/noir-lang/noir/releases) monthly or subscribe to [Noir Discord](https://discord.gg/noir-lang) for announcements.

#### Step 2: Update Test Vectors
Once Poseidon is available, regenerate test inputs:

```bash
# In /zk/noir/Prover.toml, update inputs to match real Poseidon output
a = 42
b = 100
result = [actual Poseidon(42, 100) output]  # Recalculate
```

#### Step 3: Recompile and Redeploy
```bash
cd /zk/noir
nargo compile
nargo execute witness
make build-poseidon-wasm

# In /web/prover, reload WASM and test browser prover
# Verify all tests pass locally before deploying
```

**Estimated Effort**: 2 hours (mostly waiting for Noir release)

---

## 2. Production Verifier with Actual Plonk Verification

### Current Status
- **File**: [/programs/verifier/src/lib.rs](../programs/verifier/src/lib.rs)
- **Issue**: Only performs format checks, no actual proof verification
- **Security Impact**: ANY proof is accepted (development only)

### Production Steps

#### Step 1: Generate Verification Key
After circuit is final, extract the verification key (vk):

```bash
cd /zk/noir
nargo compile --output-dir vk_output

# This generates proof artifacts including:
# - circuit.json (circuit structure)
# - abi.json (circuit inputs/outputs)
# The vk is embedded in the compiled circuit

# Extract vk as Rust bytes constant:
# cat vk_output/circuit.json | python3 -c "import sys, json; vk=json.load(sys.stdin)['verification_key']; print(f'const VK: &[u8] = b\"{vk}\";')" 
```

#### Step 2: Integrate Plonk Verifier

Option A: Use Noir's JavaScript verifier on-chain (Recommended for Solana)

```rust
// In /programs/verifier/src/lib.rs

// Add dependency in Cargo.toml:
// [dependencies]
// // Noir JS verifier compiled to Rust via wasm-bindgen
// // Until official Rust binding, use custom implementation

// For now: Use a simplified Plonk verification stub
use anchor_lang::prelude::*;

const VK: &[u8] = b"[paste verification key bytes here]";

pub fn verify_plonk_proof(proof: &[u8], vk: &[u8], public_inputs: &[u8]) -> bool {
    // TODO: Implement Plonk verification algorithm
    // Reference: https://eprint.iacr.org/2019/953.pdf
    
    // Temporary placeholder:
    proof.len() > 0 && vk.len() > 0 && public_inputs.len() > 0
}

#[program]
pub mod verifier {
    use super::*;

    pub fn verify(
        _ctx: Context<Verify>,
        proof: Vec<u8>,
        public_inputs: Vec<u8>,
    ) -> Result<()> {
        // Actual verification instead of format checks
        require!(
            verify_plonk_proof(&proof, VK, &public_inputs),
            ErrorCode::ProofVerificationFailed
        );
        Ok(())
    }
}
```

Option B: Use existing Plonk libraries

- **Barretenberg** (AZTEC's verifier): 
  - Library: https://github.com/AztecProtocol/barretenberg
  - Rust bindings available, but heavy (~50MB compiled)
  - Recommended for high-security applications

- **Halo2** (Zcash's proving system):
  - Library: https://github.com/zcash/halo2
  - Modular design, lighter weight
  - Requires curve compatibility with Noir

#### Step 3: Add Public Inputs to Circuit
Modify circuit to expose public inputs (needed for on-chain verification):

```rust
// In /zk/noir/src/main.nr

pub fn main(
    a: Field,
    b: Field,
    note_hash: pub Field,      // Public input: the hash to verify
    merkle_root: pub Field,     // Public input: tree root
) -> Field {
    let computed_hash = poseidon_hash2(a, b);
    assert_eq(computed_hash, note_hash);
    computed_hash
}
```

#### Step 4: Update Browser Prover
Serialize public inputs alongside proof:

```typescript
// In /web/prover/pages/prover.tsx

const submitProofToChain = async () => {
    // ... existing proof generation code ...
    
    const publicInputs = [
        proof.noteHash,
        proof.merkleRoot,
    ];
    
    // Send to verifier with public inputs
    const tx = new Transaction();
    tx.add(
        await program.methods.verify(
            Buffer.from(proof.proof),
            publicInputs.map(pi => new BN(pi))
        ).accounts({
            programAccount: verifierProgramId,
        }).instruction()
    );
    
    // Sign and submit...
};
```

#### Step 5: Testing
Create comprehensive proof verification tests:

```typescript
// In /tests/verifier_integration.test.ts

test("Verifies valid proof with public inputs", async () => {
    const { proof, publicInputs } = await generateValidProof();
    
    const result = await verifier.verify(proof, publicInputs);
    expect(result.success).toBe(true);
});

test("Rejects invalid proof", async () => {
    const { proof, publicInputs } = await generateValidProof();
    const invalidProof = proof.slice(1);  // Tamper with proof
    
    const result = await verifier.verify(invalidProof, publicInputs);
    expect(result.success).toBe(false);
});

test("Rejects valid proof with wrong public inputs", async () => {
    const { proof, publicInputs } = await generateValidProof();
    const wrongInputs = publicInputs.map(x => x + 1);  // Modify inputs
    
    const result = await verifier.verify(proof, wrongInputs);
    expect(result.success).toBe(false);
});
```

**Estimated Effort**: 8-12 hours (depending on library choice and testing depth)

---

## 3. Browser Prover Enhancements

### Current Status
- ✅ Phantom wallet integration complete
- ✅ Proof generation working
- ✅ Transaction signing and submission UI

### Recommended Production Enhancements

#### 3.1 Error Handling & Retry Logic
```typescript
const submitProofToChain = async (maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const signature = await wallet.signAndSendTransaction(tx);
            const confirmed = await connection.confirmTransaction(signature);
            
            if (confirmed.value.err) throw new Error("Transaction failed");
            return signature;
        } catch (error) {
            if (attempt === maxRetries) throw error;
            await new Promise(r => setTimeout(r, 2 ** attempt * 1000)); // Exponential backoff
        }
    }
};
```

#### 3.2 Input Validation
```typescript
const validateInputs = (a: number, b: number): string | null => {
    if (a < 0 || b < 0) return "Inputs must be non-negative";
    if (a >= 2**253 || b >= 2**253) return "Inputs too large (exceed field size)";
    return null;
};
```

#### 3.3 Gas Estimation
```typescript
const estimateGasRequired = async () => {
    const tx = new Transaction(); // Build your transaction
    const fees = await connection.getRecentBlockhash();
    const size = tx.serialize().length;
    const estimatedCost = (size / 1024) * fees.feeCalculator.lamportsPerSignature;
    return estimatedCost;
};
```

#### 3.4 Progress Indicators
Add UI feedback for long-running operations:
- Proof generation (can take 5-30s depending on circuit complexity)
- Transaction confirmation (30-60s on Solana)

---

## 4. Deployment Checklist

### Pre-Production
- [ ] Real Poseidon hash implemented and tested
- [ ] Verification key extracted and hardcoded
- [ ] Plonk verifier integration complete and tested
- [ ] All tests passing (local validator)
- [ ] Gas costs estimated and documented
- [ ] Wallet integration tested on devnet with real transactions
- [ ] Error handling for failed transactions
- [ ] Circuit formal verification (optional, but recommended)

### Devnet Deployment
```bash
# Build programs
anchor build -p verifier

# Deploy to devnet
anchor deploy -p verifier --provider.cluster devnet

# Update browser prover with devnet verifier program ID
# (currently hardcoded in prover.tsx)

# Run e2e tests on devnet
npm run test:devnet
```

### Mainnet Deployment
```bash
# Audit smart contracts
cargo-audit

# Final testing on devnet with mainnet-equivalent parameters
anchor test --provider.cluster devnet

# Deploy to mainnet (requires authorization)
anchor deploy -p verifier --provider.cluster mainnet-beta

# Monitor on https://explorer.solana.com
# Update program ID in production frontend
```

---

## 5. Timeline Estimate

| Phase | Task | Duration | Blocker |
|-------|------|----------|---------|
| **Week 1** | Poseidon stdlib available | 0h (external) | Noir release schedule |
| **Week 1** | Implement Plonk verifier | 8-12h | Noir stdlib release |
| **Week 2** | Integration testing | 4h | Both above complete |
| **Week 2** | Devnet testing | 4h | QA sign-off |
| **Week 3** | Mainnet deployment | 2h | Final security review |

---

## 6. Security Considerations

### Code Audit
Before mainnet:
- [ ] Internal security review of verifier logic
- [ ] External audit of circuit constraints (optional but recommended)
- [ ] Fuzzing of proof validation with malformed proofs

### Proof Validation
- Ensure all public inputs are validated
- Check for integer overflow in constraint equations
- Verify field arithmetic is correct (no off-by-one errors)

### Account Security
- Use PDA (Program Derived Address) for proof storage if needed
- Implement rate limiting to prevent proof spam
- Monitor verifier for suspicious patterns

---

## 7. References

- Noir Documentation: https://docs.noir-lang.org
- Plonk Paper: https://eprint.iacr.org/2019/953.pdf
- Solana Program Security: https://docs.solana.com/developing/programming-model/security
- Barretenberg Verifier: https://github.com/AztecProtocol/barretenberg
- Halo2: https://github.com/zcash/halo2

---

## Questions?

Refer to the inline `// TODO` comments in:
- [/zk/noir/src/main.nr](../zk/noir/src/main.nr) — Poseidon integration
- [/programs/verifier/src/lib.rs](../programs/verifier/src/lib.rs) — Plonk verification
- [/web/prover/pages/prover.tsx](../web/prover/pages/prover.tsx) — Error handling
