# Makefile helpers for building Noir circuit and WASM (dev)
.PHONY: build proof

build:
	# compile to wasm (requires noirc installed and in PATH)
	noirc compile note_membership.nr --target wasm

prove:
	# create a proof using example input (requires noirc wasm prove tool)
	noirc prove --input input.example.json --program target/wasm32-wasi/release/note_membership.wasm --output proof.json

# Poseidon secure circuit targets
build-poseidon:
	noirc compile note_membership_poseidon.nr --target wasm

prove-poseidon:
	noirc prove --input input.example.json --program target/wasm32-wasi/release/note_membership_poseidon.wasm --output proof_poseidon.json

clean:
	rm -rf target proof.json
