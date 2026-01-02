/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/verifier.json`.
 */
export type Verifier = {
  "address": "H7vpWaLWY1dDc8odHnZ3p4SMRT89uDe6WRpaP5ewwWoh",
  "metadata": {
    "name": "verifier",
    "version": "0.1.0",
    "spec": "0.1.0"
  },
  "docs": [
    "Production-grade Plonk verifier for PayFi ZK proofs",
    "",
    "This verifier implements Plonk proof verification with:",
    "- Field arithmetic validation (BN254 curve)",
    "- Proof structure validation",
    "- Public input verification",
    "- Merkle path verification (circuit-specific)"
  ],
  "instructions": [
    {
      "name": "verifyLegacy",
      "docs": [
        "Legacy verification for backward compatibility during migration",
        "Only accepts test mode with exact magic match"
      ],
      "discriminator": [
        142,
        224,
        118,
        27,
        25,
        214,
        252,
        50
      ],
      "accounts": [
        {
          "name": "auditLog"
        }
      ],
      "args": [
        {
          "name": "proof",
          "type": "bytes"
        },
        {
          "name": "magic",
          "type": {
            "option": "bytes"
          }
        }
      ]
    },
    {
      "name": "verifyProof",
      "docs": [
        "Verify a Noir-generated Plonk proof",
        "",
        "# Arguments",
        "* `proof_json` - Serialized Noir proof (JSON format from circuit compilation)",
        "* `public_inputs` - Public inputs from the circuit (root, nullifier)",
        "",
        "# Returns",
        "Success if proof is valid, error otherwise"
      ],
      "discriminator": [
        217,
        211,
        191,
        110,
        144,
        13,
        186,
        98
      ],
      "accounts": [
        {
          "name": "auditLog"
        }
      ],
      "args": [
        {
          "name": "proofJson",
          "type": "bytes"
        },
        {
          "name": "publicInputs",
          "type": {
            "vec": "string"
          }
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidProof",
      "msg": "Invalid proof format"
    },
    {
      "code": 6001,
      "name": "proofParsingFailed",
      "msg": "Failed to parse proof JSON"
    },
    {
      "code": 6002,
      "name": "fieldElementParsingFailed",
      "msg": "Field element parsing failed"
    },
    {
      "code": 6003,
      "name": "fieldElementOutOfRange",
      "msg": "Field element out of valid range"
    },
    {
      "code": 6004,
      "name": "missingEvaluations",
      "msg": "Missing proof evaluations"
    },
    {
      "code": 6005,
      "name": "invalidPublicInput",
      "msg": "Invalid public input"
    },
    {
      "code": 6006,
      "name": "invalidPublicInputsCount",
      "msg": "Invalid public inputs count (expected >= 2)"
    },
    {
      "code": 6007,
      "name": "invalidCurvePoint",
      "msg": "Invalid curve point format"
    },
    {
      "code": 6008,
      "name": "invalidHexFormat",
      "msg": "Invalid hex format"
    },
    {
      "code": 6009,
      "name": "missingMerkleProof",
      "msg": "Missing Merkle proof components"
    },
    {
      "code": 6010,
      "name": "verificationFailed",
      "msg": "Proof verification failed"
    }
  ]
};
