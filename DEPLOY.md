# Devnet Deployment Guide

This document covers steps to deploy `payfi` to Solana Devnet for testing.

## Pre-requisites
- Solana CLI installed and configured
- Anchor installed
- Deployer keypair with devnet SOL (use `solana airdrop`)

## Steps
1. Set Solana cluster to devnet
   ```bash
   solana config set --url https://api.devnet.solana.com
   solana config set --keypair /path/to/deployer-keypair.json
   solana airdrop 2 $(solana config get | grep Keypair | awk '{print $2}')
   ```
2. Build and deploy
   ```bash
   anchor build
   anchor deploy --provider.cluster devnet
   ```
3. Update `Anchor.toml` if necessary:
   ```toml
   [programs.devnet]
   payfi = "<DEPLOYED_PROGRAM_ID>"
   ```
4. Run devnet smoke test (requires `RUN_DEVNET_SMOKE=1`):
   ```bash
   RUN_DEVNET_SMOKE=1 yarn smoke:devnet
   ```

## Security & Production Checklist
- Replace single admin with a multisig (GPA or on-chain multisig) for upgrade authority.
- Implement and integrate full on-chain verifier (Noir→PLONK) before trusting relayer attestations on mainnet.
- Audit the ed25519 attestation payload format and ensure proper replay protection.
- Add monitoring and an emergency `pause` procedure.

## Notes
- If a transaction fails due to compute limits, consider adding a ComputeBudget instruction before the high-cost instruction or splitting workloads. To enable our built-in helper at build time, build with the Cargo feature `compute_budget` and deploy with the same feature: `anchor build -- --features compute_budget` and `anchor deploy -- --features compute_budget`.
- Use `anchor logs --provider.cluster devnet` to inspect program logs and debug.
