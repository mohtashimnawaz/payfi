{
  "address": "7SU3shMVxuzrQa614tkoQqicKPe1U9BFRJRzXoemFaeX",
  "metadata": {
    "name": "payfi",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "add_relayer",
      "discriminator": [
        184,
        240,
        94,
        199,
        19,
        71,
        21,
        192
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "admin"
          ]
        }
      ],
      "args": [
        {
          "name": "addr",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "add_to_denylist",
      "discriminator": [
        194,
        213,
        51,
        109,
        157,
        0,
        252,
        157
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "admin"
          ]
        }
      ],
      "args": [
        {
          "name": "addr",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "deposit",
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "from",
          "writable": true
        },
        {
          "name": "admin",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true
        },
        {
          "name": "vault_token_account",
          "writable": true
        },
        {
          "name": "tree_state",
          "writable": true
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "commitment",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "encrypted_note",
          "type": {
            "option": "bytes"
          }
        }
      ]
    },
    {
      "name": "init_nullifier_chunk",
      "docs": [
        "Initialize a Nullifier chunk account for a specific chunk index."
      ],
      "discriminator": [
        186,
        70,
        19,
        88,
        219,
        99,
        42,
        24
      ],
      "accounts": [
        {
          "name": "chunk",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  117,
                  108,
                  108,
                  105,
                  102,
                  105,
                  101,
                  114,
                  95,
                  99,
                  104,
                  117,
                  110,
                  107
                ]
              },
              {
                "kind": "arg",
                "path": "index"
              }
            ]
          }
        },
        {
          "name": "manager",
          "writable": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u64"
        }
      ]
    },
    {
      "name": "init_relayer_state",
      "discriminator": [
        164,
        92,
        76,
        58,
        135,
        144,
        130,
        11
      ],
      "accounts": [
        {
          "name": "relayer_state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "relayer"
              }
            ]
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "relayer",
          "type": "pubkey"
        },
        {
          "name": "limit",
          "type": "u64"
        },
        {
          "name": "window_seconds",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "tree_state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "nullifier_manager",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  117,
                  108,
                  108,
                  105,
                  102,
                  105,
                  101,
                  114,
                  95,
                  109,
                  97,
                  110,
                  97,
                  103,
                  101,
                  114
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "admin",
          "type": "pubkey"
        },
        {
          "name": "vault_token_account",
          "type": "pubkey"
        },
        {
          "name": "vault_bump",
          "type": "u8"
        },
        {
          "name": "tree_bump",
          "type": "u8"
        },
        {
          "name": "max_chunks",
          "type": "u64"
        },
        {
          "name": "admin_bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "remove_from_denylist",
      "discriminator": [
        48,
        248,
        96,
        109,
        152,
        170,
        87,
        38
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "admin"
          ]
        }
      ],
      "args": [
        {
          "name": "addr",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "remove_relayer",
      "discriminator": [
        154,
        149,
        161,
        231,
        69,
        74,
        136,
        237
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "admin"
          ]
        }
      ],
      "args": [
        {
          "name": "addr",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "set_pause",
      "discriminator": [
        63,
        32,
        154,
        2,
        56,
        103,
        79,
        45
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "admin"
          ]
        }
      ],
      "args": [
        {
          "name": "paused",
          "type": "bool"
        }
      ]
    },
    {
      "name": "set_verifier_mode",
      "discriminator": [
        245,
        30,
        56,
        2,
        59,
        95,
        115,
        211
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "admin"
          ]
        },
        {
          "name": "verifier_program",
          "docs": [
            "When using mode=2 (CPI), pass the verifier program account"
          ],
          "optional": true
        }
      ],
      "args": [
        {
          "name": "mode",
          "type": "u8"
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
      "name": "update_root",
      "docs": [
        "Update the on-chain merkle/compression root (Light Compression stub)"
      ],
      "discriminator": [
        58,
        195,
        57,
        246,
        116,
        198,
        170,
        138
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "admin"
          ]
        },
        {
          "name": "tree_state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "new_root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "admin"
          ]
        },
        {
          "name": "admin",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "vault_token_account",
          "writable": true
        },
        {
          "name": "recipient_token_account",
          "writable": true
        },
        {
          "name": "tree_state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "nullifier_chunk",
          "docs": [
            "Nullifier chunk corresponding to the nullifier being spent"
          ],
          "writable": true
        },
        {
          "name": "verifier_program"
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "proof",
          "type": "bytes"
        },
        {
          "name": "nullifier",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw_by_relayer",
      "docs": [
        "Withdraw executed by a trusted relayer who has validated the proof off-chain.",
        "Relayer must be in `admin.relayers` and must sign this tx."
      ],
      "discriminator": [
        218,
        158,
        161,
        41,
        153,
        108,
        16,
        117
      ],
      "accounts": [
        {
          "name": "relayer",
          "signer": true
        },
        {
          "name": "admin",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "vault_token_account",
          "writable": true
        },
        {
          "name": "recipient_token_account",
          "writable": true
        },
        {
          "name": "tree_state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  101,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "nullifier_chunk",
          "writable": true
        },
        {
          "name": "relayer_state",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  108,
                  97,
                  121,
                  101,
                  114,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "relayer"
              }
            ]
          }
        },
        {
          "name": "token_program",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "nullifier",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "attestation_sig",
          "type": "bytes"
        },
        {
          "name": "attestation_pubkey",
          "type": "pubkey"
        },
        {
          "name": "attestation_expiry",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Admin",
      "discriminator": [
        244,
        158,
        220,
        65,
        8,
        73,
        4,
        65
      ]
    },
    {
      "name": "NullifierChunk",
      "discriminator": [
        205,
        240,
        77,
        42,
        254,
        74,
        81,
        180
      ]
    },
    {
      "name": "NullifierManager",
      "discriminator": [
        123,
        69,
        163,
        38,
        148,
        188,
        199,
        72
      ]
    },
    {
      "name": "RelayerState",
      "discriminator": [
        9,
        148,
        69,
        96,
        113,
        66,
        54,
        46
      ]
    },
    {
      "name": "TreeState",
      "discriminator": [
        251,
        163,
        240,
        50,
        165,
        217,
        193,
        100
      ]
    },
    {
      "name": "Vault",
      "discriminator": [
        211,
        8,
        232,
        43,
        2,
        152,
        117,
        119
      ]
    }
  ],
  "events": [
    {
      "name": "EncryptedNoteEvent",
      "discriminator": [
        211,
        193,
        135,
        160,
        45,
        133,
        163,
        86
      ]
    },
    {
      "name": "WithdrawEvent",
      "discriminator": [
        22,
        9,
        133,
        26,
        160,
        44,
        71,
        192
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "RootMismatch",
      "msg": "Provided root does not match the on-chain root"
    },
    {
      "code": 6001,
      "name": "NullifierAlreadyUsed",
      "msg": "Nullifier already used"
    },
    {
      "code": 6002,
      "name": "Unauthorized",
      "msg": "Unauthorized"
    },
    {
      "code": 6003,
      "name": "DenyListBlocked",
      "msg": "Address is on deny list"
    },
    {
      "code": 6004,
      "name": "InvalidProof",
      "msg": "Invalid proof"
    },
    {
      "code": 6005,
      "name": "ContractPaused",
      "msg": "Contract is paused"
    },
    {
      "code": 6006,
      "name": "AttestationExpired",
      "msg": "Attestation expired"
    },
    {
      "code": 6007,
      "name": "InvalidAttestation",
      "msg": "Invalid attestation or signature"
    },
    {
      "code": 6008,
      "name": "RelayerRateLimited",
      "msg": "Relayer rate limited"
    },
    {
      "code": 6009,
      "name": "ComputeBudgetRequestFailed",
      "msg": "Compute budget request failed"
    },
    {
      "code": 6010,
      "name": "ChunkLimitReached",
      "msg": "Nullifier chunk limit reached"
    }
  ],
  "types": [
    {
      "name": "Admin",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "deny_list",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "relayers",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "verifier_mode",
            "type": "u8"
          },
          {
            "name": "verifier_magic",
            "type": "bytes"
          },
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "EncryptedNoteEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "commitment",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "encrypted",
            "type": "bytes"
          }
        ]
      }
    },
    {
      "name": "NullifierChunk",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "type": "u64"
          },
          {
            "name": "bitmap",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "NullifierManager",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "count",
            "type": "u64"
          },
          {
            "name": "max_chunks",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "RelayerState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "window_start",
            "type": "u64"
          },
          {
            "name": "count",
            "type": "u64"
          },
          {
            "name": "limit",
            "type": "u64"
          },
          {
            "name": "window_seconds",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "TreeState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "root",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "Vault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "token_account",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "WithdrawEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "nullifier",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    }
  ]
}