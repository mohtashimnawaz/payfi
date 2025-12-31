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
# Export wasm to web prover public for browser usage
export-wasm:
	@mkdir -p ../../web/prover/public
	cp target/wasm32-wasi/release/note_membership_poseidon.wasm ../../web/prover/public/note_membership_poseidon.wasm || true

# Unit test circuit for Poseidon primitive
build-poseidon-unit:
	noirc compile poseidon_unit.nr --target wasm

prove-poseidon-unit:
	noirc prove --input input.poseidon.unit.json --program target/wasm32-wasi/release/poseidon_unit.wasm --output proof_poseidon_unit.json

test-poseidon: build-poseidon-unit prove-poseidon-unit
	@echo "Poseidon unit test proof generated: proof_poseidon_unit.json"
clean:
	rm -rf target proof.json
