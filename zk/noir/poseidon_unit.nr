// Unit test circuit for Poseidon primitive
// Asserts poseidon([a,b]) == expected

pub fn main(private a: Field, private b: Field, public expected: Field) -> Field {
    let out = poseidon([a, b]);
    assert(out == expected);
    1
}
