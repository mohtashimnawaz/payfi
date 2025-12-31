Noir integration plan (payfi)

Goal: Add a client-side Noir WASM prover and on-chain verifier to validate shielded withdraw proofs.

What I added now (scaffold):
- `zk/noir/note_membership.nr` - minimal demo circuit (NOT PROD SECURE)
- `zk/noir/Makefile` - convenience rules for `build` and `prove`
- `zk/noir/input.example.json` - example witness input
- `web/prover` - minimal Next.js demo scaffolding and `scripts/run_proof.js` helper

Next steps:
1) Implement secure hash function (Poseidon/Pedersen) in Noir circuit for real commitments
2) Build WASM & JS bindings integration - use official `@noir-lang/noir_wasm` bindings for browser and add a small Next.js page that demonstrates generating a proof client-side (secrets stay in the browser). Use `make export-wasm` to copy the compiled WASM into `web/prover/public`.
3) Add E2E test: generate proof (WASM), serialize, and call `programs/verifier` CPI stub to accept and check format (proof format checking only for now). The test added is `tests/verifier_proof.test.ts`.
4) Add CI job to build noir wasm and run proof tests on PRs (the new GitHub workflow `noir-ci.yml` will attempt to install `noirc` and run the poseidon build/prove steps).

How you run the demo locally:
- Install Noir toolchain (see https://noir-lang.org/docs)
- `cd zk/noir && make build && make prove`
- `cd web/prover && npm install && npm run prove:run`

If you'd like, next I will:
- Implement the Noir circuit using Poseidon and test vectors (secure nullifier derivation), and
- Add a Node/Browser prover integration using `noir_wasm` and an example page that produces a proof in the browser and posts it to a dev endpoint.

Next actions I can take: integrate `@noir-lang/noir_wasm` in the browser page so proofs can be generated client-side, or wire a full CPI path from payfi -> verifier for end-to-end withdraw tests. Which do you want first?