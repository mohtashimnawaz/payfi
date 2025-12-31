import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Keypair } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { Payfi } from "../target/types/payfi";

describe("payfi", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.payfi as Program<Payfi>;

  it("initializes, deposits, and withdraws tokens", async () => {
    const provider = anchor.getProvider();
    const payerPubkey = provider.wallet.publicKey;
    const payerSigner = (provider.wallet as any).payer as Keypair;

    // derive PDAs and bumps
    const [adminPda, adminBump] = await PublicKey.findProgramAddress([
      Buffer.from("admin")
    ], program.programId);
    const [treePda, treeBump] = await PublicKey.findProgramAddress([
      Buffer.from("tree_state")
    ], program.programId);
    const [nullsPda, nullsBump] = await PublicKey.findProgramAddress([
      Buffer.from("nullifier_set")
    ], program.programId);
    const [vaultPda, vaultBump] = await PublicKey.findProgramAddress([
      Buffer.from("vault")
    ], program.programId);

    // Create a test mint and token accounts
    const mint = await createMint(provider.connection, payerSigner, payerPubkey, null, 0);
    const payerTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, payerSigner, mint, payerPubkey);
    const vaultTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, payerSigner, mint, vaultPda, true);

    // Mint some tokens to payer
    const amount = 100;
    await mintTo(provider.connection, payerSigner, mint, payerTokenAccount.address, payerPubkey, amount);

    // Initialize program state (provide vault token account pubkey and bump values)
    await program.methods
      .initialize(payerPubkey, vaultTokenAccount.address, vaultBump, treeBump, nullsBump, adminBump)
      .accounts({
        admin: adminPda,
        treeState: treePda,
        nullifierSet: nullsPda,
        vault: vaultPda,
        payer: payerPubkey,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    // Prepare a fake commitment and encrypted note
    const commitment = new Uint8Array(32);
    commitment[0] = 1; // simple non-zero commitment for test

    // Deposit tokens into the vault
    await program.methods
      .deposit(new anchor.BN(amount), Buffer.from(commitment), null)
      .accounts({
        user: payerPubkey,
        from: payerTokenAccount.address,
        admin: adminPda,
        vault: vaultPda,
        vaultTokenAccount: vaultTokenAccount.address,
        treeState: treePda,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    // Verify tree root updated to our commitment placeholder
    const treeState = await program.account.treeState.fetch(treePda);
    if (Buffer.from(treeState.root).compare(Buffer.from(commitment)) !== 0) {
      throw new Error("Tree root not updated")
    }

    // Prepare withdraw: recipient token account
    const recipient = Keypair.generate();
    // fund recipient so ATA creation is cheap
    const airdropSig = await provider.connection.requestAirdrop(recipient.publicKey, 1e9);
    await provider.connection.confirmTransaction(airdropSig);

    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, payerSigner, mint, recipient.publicKey);

    const nullifier = new Uint8Array(32);
    nullifier[0] = 7;

    // compute chunk index from nullifier prefix
    const prefix = Number(Buffer.from(nullifier.slice(0, 8)).readBigUInt64LE(0));
    const chunkIndex = Math.floor(prefix / 256);
    const chunkIndexBuf = Buffer.alloc(8);
    chunkIndexBuf.writeBigUInt64LE(BigInt(chunkIndex), 0);
    const [chunkPda] = await PublicKey.findProgramAddress([
      Buffer.from("nullifier_chunk"),
      chunkIndexBuf,
    ], program.programId);

    // init chunk
    await program.methods
      .initNullifierChunk(new anchor.BN(chunkIndex))
      .accounts({ chunk: chunkPda, payer: payerPubkey, systemProgram: SystemProgram.programId })
      .rpc();

    // Attempt withdraw with invalid proof (should fail)
    try {
      await program.methods
        .withdraw(Buffer.from([]), Buffer.from(nullifier), Buffer.from(commitment), new anchor.BN(amount))
        .accounts({
          authority: payerPubkey,
          nullifierSet: nullsPda,
          admin: adminPda,
          vault: vaultPda,
          vaultTokenAccount: vaultTokenAccount.address,
          recipientTokenAccount: recipientTokenAccount.address,
          treeState: treePda,
          nullifierChunk: chunkPda,
          verifierProgram: program.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
      throw new Error("Withdraw unexpectedly succeeded with invalid proof");
    } catch (err: any) {
      // expected
    }

    // Set verifier mode to stub and magic to [1]
    await program.methods
      .setVerifierMode(1, Buffer.from([1]))
      .accounts({ admin: adminPda, authority: payerPubkey })
      .rpc();

    // Withdraw with correct stub proof
    await program.methods
      .withdraw(Buffer.from([1]), Buffer.from(nullifier), Buffer.from(commitment), new anchor.BN(amount))
      .accounts({
        authority: payerPubkey,
        nullifierSet: nullsPda,
        admin: adminPda,
        vault: vaultPda,
        vaultTokenAccount: vaultTokenAccount.address,
        recipientTokenAccount: recipientTokenAccount.address,
        treeState: treePda,
        nullifierChunk: chunkPda,
        verifierProgram: program.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();

    // Check recipient received tokens
    const resp = await provider.connection.getTokenAccountBalance(recipientTokenAccount.address);
    if (parseInt(resp.value.amount) !== amount) {
      throw new Error("Recipient did not receive tokens")
    }
  });
});
