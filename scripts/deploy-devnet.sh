#!/usr/bin/env bash
set -euo pipefail

# Deploy the Anchor program to devnet. Ensure you have a funded deployer keypair.
# Usage: ./scripts/deploy-devnet.sh <deployer-keypair-path>

if [ -z "${1-}" ]; then
  echo "Usage: $0 <deployer-keypair-path>"
  exit 1
fi

KEYPAIR=$1

echo "Setting solana config to devnet"
solana config set --url https://api.devnet.solana.com
solana config set --keypair $KEYPAIR

echo "Airdropping a little SOL to deployer (devnet)."
solana airdrop 2 $(solana config get | grep Keypair | awk '{print $2}') || true

echo "Building programs..."
anchor build

echo "Deploying to devnet..."
anchor deploy --provider.cluster devnet

echo "Deployment complete. Update Anchor.toml [programs.devnet] with the deployed program id if needed."