# Devnet Test Report — PayFi

Date: January 2, 2026

## Summary
- Environment: Solana devnet (https://api.devnet.solana.com)
- Result: Devnet smoke test completed successfully after initializing required on-chain PDAs
- Scope: Minimal deposit/withdraw smoke flow (sanity check)

## Actions performed
1. **Verified devnet connectivity**
   - `solana cluster-version --url devnet` → OK
2. **Deployed PayFi program to devnet**
   - New Program ID: `7SU3shMVxuzrQa614tkoQqicKPe1U9BFRJRzXoemFaeX`
   - Confirmed program exists on devnet
3. **Initialized on-chain state** (created PDAs required by tests)
   - Script: `scripts/init_devnet.ts`
   - Command used:
     ```bash
     ANCHOR_PROVIDER_URL=https://api.devnet.solana.com \
     ANCHOR_WALLET=~/.config/solana/id.json \
     npx ts-node --transpile-only scripts/init_devnet.ts
     ```
   - Initialize transaction signature: `3METyupTLG7N5TYxCbbLTHz4d7JETEw3U6TmDR7imgeHEHrhAcLULunwc2AHPAiL1oNAe5bAT35YEpMepZ8U2j2o`
   - PDAs created:
     - admin: `GiEK4syM94RSG341mCav5vLWFJrPJAzDsg3sTdXzNZ7E`
     - tree_state: `78369xkTLP5KVpLoZDuV8u7LAwKvoFjwztAcN5qr13XV`
     - nullifier_manager: `84kzu4UhiCcDBmmt6jSZ4PNBPRGCGZh8BYwzWdPKBhZe`
     - vault: `AryiPwnpJLeabm4mk9VrjxC4CfhqFXXdmSXRUofLUAXv`

4. **Ran devnet smoke tests**
   - Command:
     ```bash
     ANCHOR_PROVIDER_URL=https://api.devnet.solana.com \
     ANCHOR_WALLET=~/.config/solana/id.json \
     npm run smoke:devnet
     ```
   - Output excerpt:
     - `Cluster: https://api.devnet.solana.com`
     - `Found TreeState account; running minimal deposit/withdraw flow (devnet).` 
     - `Basic devnet smoke flow completed. Please run the full integration checklist for production verification.`
   - Result: Smoke flow succeeded (sanity checks passed)

## Notes & Recommendations
- The smoke test is minimal and **does not** replace a full integration test or security audit. It confirms on-chain initialization and a basic flow using token minting and transfers.
- Next actions:
  1. Add and run **full integration tests** (include deposits, nullifier chunk init, withdraw by relayer flows, denial list behavior, edge cases using malformed proofs). Update `tests/payfi.ts` to target devnet where necessary.
  2. Run **load/performance tests** to ensure gas/compute usage is acceptable on devnet.
  3. Continue **Phase 6 security audit** (self-audit or professional) focusing on cryptography and proof verification paths.
  4. After tests & audit pass, proceed to **Phase 8: Mainnet deployment**.

## Repro Commands (quick)
```bash
# Initialize PDAs
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com \
ANCHOR_WALLET=~/.config/solana/id.json \
 npx ts-node --transpile-only scripts/init_devnet.ts

# Run smoke tests
ANCHOR_PROVIDER_URL=https://api.devnet.solana.com \
ANCHOR_WALLET=~/.config/solana/id.json \
 npm run smoke:devnet
```

---
**Test Report generated:** January 2, 2026

