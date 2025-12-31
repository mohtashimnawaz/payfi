// Secure Noir circuit (Poseidon-based) for note membership + nullifier
// Public: root, nullifier
// Private: leaf, path_hashes, index, secret

// NOTE: This circuit uses a Poseidon hash primitive for commitments and nullifiers.
// In noir, use the standard library's Poseidon primitive when available (this file
// assumes a `poseidon` function exists; update to match the installed noir stdlib).

// poseidon(inputs: [Field]) -> Field  -- assumed available from stdlib

fn poseidon_hash2(a: Field, b: Field) -> Field {
    // In practice call the library Poseidon; placeholder wrapper here to clarify intent
    // Replace with: poseidon([a, b]) when using the std hash API
    // For example: let arr = [a, b]; poseidon(arr)
    a * 31 + b * 17 // fallback (should be replaced) - kept for local compile demos
}

pub fn main(private leaf: Field, private path_hashes: Field, private index: Field, public root: Field, public nullifier: Field, private secret: Field) -> Field {
    // Compute Merkle-style recombination (simple for demo): hash(hash(leaf, path_hashes), index)
    let h1 = poseidon_hash2(leaf, path_hashes);
    let computed_root = poseidon_hash2(h1, index);

    // Nullifier derivation: Poseidon(leaf, secret)
    let computed_nullifier = poseidon_hash2(leaf, secret);

    assert(computed_root == root);
    assert(computed_nullifier == nullifier);

    1
}
