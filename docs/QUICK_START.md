# PayFi ZK Protocol — Developer Quick Start

Get up and running with the PayFi ZK proof system in 10 minutes.

---

## Prerequisites

- **Node.js** 16+: `node --version`
- **Rust**: `rustc --version`
- **Solana CLI** 1.18.0+: `solana --version`
- **Anchor** 0.32.1+: `anchor --version`
- **Noir** (via noirup): `nargo --version`

### Install Noir

```bash
# Install Noir version manager
curl -L https://install.sh.noir.rs | bash

# Reload shell
source ~/.bashrc
# or
source ~/.zshrc

# Verify installation
nargo --version  # Should be 0.23.0 or later
```

---

## Local Setup (5 minutes)

### 1. Clone & Install Dependencies

```bash
cd /Users/mohtashimnawaz/Desktop/payfi
npm install
```

### 2. Build the Circuit

```bash
cd zk/noir
nargo compile
nargo execute witness
```

Expected output:
```
✓ Compiled successfully
✓ Generated witness
```

### 3. Build the Verifier Program

```bash
cd ../../programs/verifier
anchor build
```

---

## Test Locally (3 minutes)

### Option A: Run All Tests (Recommended)

```bash
cd /Users/mohtashimnawaz/Desktop/payfi

# Start local Solana validator in background
solana-test-validator &
VALIDATOR_PID=$!

# Wait for startup
sleep 5

# Run tests
anchor test --provider.cluster localnet

# Cleanup
kill $VALIDATOR_PID
```

### Option B: Run Specific Tests

```bash
# Test circuit only
cd zk/noir
nargo check
nargo compile

# Test on-chain verifier only
cd ../../programs/verifier
anchor test --provider.cluster localnet

# Test browser prover UI (manual)
cd ../../web/prover
npm run dev
# Visit http://localhost:3000/prover
# Connect wallet, generate proof, submit
```

---

## Browser Prover (2 minutes)

### Prerequisites
- **Phantom Wallet** browser extension installed
- **Solana devnet SOL** (free from faucet)

### Steps

1. Start local validator:
   ```bash
   solana-test-validator
   ```

2. Run the browser prover:
   ```bash
   cd web/prover
   npm run dev
   ```

3. Open http://localhost:3000/prover

4. Click "Connect Wallet" and approve in Phantom

5. Enter values for `a` and `b`, click "Generate Proof"

6. Once proof is generated, click "Submit to Chain"

7. Approve the transaction in Phantom

---

## Project Structure

```
payfi/
├── zk/noir/              # Noir circuit (ZK proof generation)
│   ├── src/main.nr       # Circuit logic (poseidon hash placeholder)
│   ├── Nargo.toml        # Circuit manifest
│   ├── Prover.toml       # Test inputs
│   └── Makefile          # Build automation
│
├── programs/verifier/    # Solana verifier program
│   ├── src/lib.rs        # On-chain proof verification
│   ├── Cargo.toml        # Rust dependencies
│   └── tests/            # Integration tests
│
├── web/prover/           # Browser prover UI
│   ├── pages/prover.tsx  # React component with Phantom wallet
│   ├── package.json      # Node dependencies
│   └── public/           # Static assets
│
├── tests/                # E2E tests
│   └── payfi.ts          # Circuit → Verifier integration
│
├── .github/workflows/    # CI/CD pipelines
│   └── test.yml          # Automated testing on push
│
└── docs/PRODUCTION_ROADMAP.md  # Production migration guide
```

---

## Development Workflow

### 1. Modify Circuit
```bash
# Edit /zk/noir/src/main.nr
vim zk/noir/src/main.nr

# Recompile and test
cd zk/noir
nargo check
nargo execute witness

# Run full test suite
cd ../..
anchor test --provider.cluster localnet
```

### 2. Modify Verifier
```bash
# Edit /programs/verifier/src/lib.rs
vim programs/verifier/src/lib.rs

# Check syntax
anchor build

# Run tests
anchor test --provider.cluster localnet
```

### 3. Modify Browser Prover
```bash
# Edit /web/prover/pages/prover.tsx
vim web/prover/pages/prover.tsx

# Run dev server
cd web/prover
npm run dev

# Test at http://localhost:3000/prover
```

---

## Common Commands

| Task | Command |
|------|---------|
| Build circuit | `cd zk/noir && nargo compile` |
| Generate proof | `cd zk/noir && nargo execute witness` |
| Build verifier | `cd programs/verifier && anchor build` |
| Test locally | `anchor test --provider.cluster localnet` |
| Dev server | `cd web/prover && npm run dev` |
| Deploy to devnet | `anchor deploy --provider.cluster devnet` |
| View on chain | `solana tx <SIGNATURE> --url devnet` |

---

## Debugging

### Circuit won't compile
```bash
cd zk/noir
nargo check  # More detailed error messages
# Check /zk/noir/src/main.nr for syntax errors
```

### Verifier tests fail
```bash
cd programs/verifier
anchor build  # Check for Rust errors
anchor test --provider.cluster localnet -- --nocapture  # Show logs
```

### Browser prover doesn't load WASM
```bash
# Rebuild WASM export
cd zk/noir
make build-poseidon-wasm

# Check browser console (F12)
# Verify WASM file exists in /web/prover/public/
```

### Wallet connection fails
```bash
# Ensure Phantom extension is installed and unlocked
# Check browser console for MetaMask/Phantom errors
# Verify local validator is running: solana ping
```

---

## Next Steps

### For Features
- See [PRODUCTION_ROADMAP.md](./PRODUCTION_ROADMAP.md) for:
  - Real Poseidon hash implementation
  - Production Plonk verifier
  - Security checklist
  - Mainnet deployment

### For Testing
- Run CI/CD locally:
  ```bash
  # Simulates GitHub Actions workflow
  .github/workflows/test.yml (run manually)
  ```

### For Deployment
- **Devnet**: `anchor deploy --provider.cluster devnet`
- **Mainnet**: See PRODUCTION_ROADMAP.md security section

---

## Support

- **Noir docs**: https://docs.noir-lang.org
- **Anchor docs**: https://www.anchor-lang.com
- **Solana docs**: https://docs.solana.com
- **GitHub issues**: Report bugs in the payfi repository

---

Happy coding! 🚀
