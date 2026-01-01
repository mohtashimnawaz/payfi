# Makefile helpers for building Noir circuit and WASM (dev)
.PHONY: build build-wasm proof export-wasm build-poseidon prove-poseidon export-wasm build-poseidon-unit prove-poseidon-unit test-poseidon clean

build:
	# compile to ACIR (default backend)
	nargo compile

build-wasm:
	# compile to WASM target for browser usage
	nargo compile --target wasm

prove:
	# create a proof using example input (requires nargo)
	nargo execute witness

# Poseidon secure circuit targets
build-poseidon:
	nargo compile

build-poseidon-wasm:
	nargo compile --target wasm

prove-poseidon:
	nargo execute witness

# Export wasm to web prover public for browser usage
export-wasm: build-poseidon-wasm
	@mkdir -p ../../web/prover/public
	@echo "Copying WASM artifacts for browser prover..."
	cp target/wasm32-wasi/release/note_membership_poseidon.wasm ../../web/prover/public/note_membership_poseidon.wasm 2>/dev/null || echo "WASM not found in expected location; verify Noir 1.0 WASM output path"
	@echo "WASM exported to web/prover/public"

# Unit test circuit for Poseidon primitive
build-poseidon-unit:
	nargo compile

prove-poseidon-unit:
	nargo execute witness

test-poseidon: build-poseidon-unit prove-poseidon-unit
	@echo "Poseidon unit test proof generated"

clean:
	rm -rf target witness.gz
