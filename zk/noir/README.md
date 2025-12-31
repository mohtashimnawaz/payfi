Noir circuits for payfi (dev/demo)

Overview
- `note_membership.nr` is a small demo circuit that proves a simplified membership relation and a nullifier derivation. This is intentionally minimal to get the tooling integrated - replace the hashing with a secure hash (Poseidon/Pedersen/Blake) for production.

Requirements
- Install Noir compiler (`noirc`) and wasm prover toolchain: https://noir-lang.org/docs
- Example steps:
  - `cargo install --locked --git https://github.com/noir-lang/noir noirc` (see official docs)

Build (local)
1. From project root:
   ```bash
   cd zk/noir
   noirc compile note_membership.nr --target wasm && noirc prove --input input.json --program target/wasm32-wasi/release/note_membership.wasm --output proof.json
   ```

Notes
- This is just a scaffold to get started. After you have `noirc` installed, the `make` target (coming) will automate building wasm and proofs.
