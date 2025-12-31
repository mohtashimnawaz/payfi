// Simple Noir circuit for demo purposes
// Public: root, nullifier
// Private: leaf, path (compact), secret

fn hash(a: Field, b: Field) -> Field {
    // very simple hash placeholder (NOT secure) - replace with Pedersen/Blake in prod
    a * 31 + b * 17
}

pub fn main(private leaf: Field, private path_hashes: Field, private index: Field, public root: Field, public nullifier: Field, private secret: Field) -> Field {
    // Recompute root by one-step (demo only): hash(hash(leaf, path_hashes), index)
    let computed = hash(hash(leaf, path_hashes), index);
    // Nullifier derivation example: hash(leaf, secret)
    let computed_nullifier = hash(leaf, secret);
    assert(computed == root);
    assert(computed_nullifier == nullifier);
    // Output 1 when valid
    1
}
