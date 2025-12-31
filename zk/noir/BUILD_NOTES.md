Poseidon build notes

- The `note_membership_poseidon.nr` circuit uses a `poseidon_hash2` wrapper to express usage of a two-input Poseidon hash. Replace the fallback arithmetic with the real Poseidon primitive or call the poseidon function from the Noir standard library when available.

- To build and produce a proof for the poseidon circuit:
  - `cd zk/noir`
  - `make build-poseidon`
  - Edit `input.poseidon.example.json` with matching values and put expected `root` and `nullifier` (or compute them off-chain using the same Poseidon hash) 
  - `make prove-poseidon` -> produces `proof_poseidon.json`

- For browser usage, use the `target/wasm32-wasi/release/note_membership_poseidon.wasm` and the wasm prover bindings (e.g., noir wasm binding) to run witness generation and proof creation client-side.
