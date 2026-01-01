import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Keypair } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import { Payfi } from "../target/types/payfi";

describe("payfi-simple", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.payfi as Program<Payfi>;

  it("initializes program, deposits tokens, and verifies state", async () => {
    const provider = anchor.getProvider();
    const payerPubkey = provider.wallet.publicKey;
    const payerSigner = (provider.wallet as any).payer as Keypair;

    console.log("Program ID:", program.programId.toBase58());

    // Derive PDAs using the actual deployed program ID (from workspace)
    const [adminPda] = await PublicKey.findProgramAddress([Buffer.from("admin")], program.programId);
    const [treePda] = await PublicKey.findProgramAddress([Buffer.from("tree_state")], program.programId);
    const [nullsManagerPda] = await PublicKey.findProgramAddress([Buffer.from("nullifier_manager")], program.programId);
    const [vaultPda, vaultBump] = await PublicKey.findProgramAddress([Buffer.from("vault")], program.programId);

    // Check if initialized already
    let adminInfo = await provider.connection.getAccountInfo(adminPda);
    let vaultTokenAccountAddress: PublicKey;
    let mint: any;
    let payerTokenAccount: any;

    if (!adminInfo) {
      console.log("Initializing program for first time...");
      // Create mint and token accounts
      mint = await createMint(provider.connection, payerSigner, payerPubkey, null, 0);
      payerTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, payerSigner, mint, payerPubkey);
      const vaultTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, payerSigner, mint, vaultPda, true);
      vaultTokenAccountAddress = vaultTokenAccount.address;

      // Mint test tokens
      await mintTo(provider.connection, payerSigner, mint, payerTokenAccount.address, payerPubkey, 1000);

      // Initialize program
      await program.methods
        .initialize(payerPubkey, vaultTokenAccountAddress, vaultBump, 0, new anchor.BN(1000), 0)
        .accounts({
          admin: adminPda,
          treeState: treePda,
          nullifierManager: nullsManagerPda,
          vault: vaultPda,
          payer: payerPubkey,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();
      console.log("Program initialized successfully");
    } else {
      console.log("Program already initialized; reusing on-chain state");
      const vaultState: any = await program.account.vault.fetch(vaultPda);
      vaultTokenAccountAddress = vaultState.tokenAccount ?? vaultState.token_account;

      const parsed = await provider.connection.getParsedAccountInfo(vaultTokenAccountAddress);
      const parsedInfo: any = (parsed.value && (parsed.value as any).data && (parsed.value as any).data.parsed) ? (parsed.value as any).data.parsed.info : null;
      if (!parsedInfo) throw new Error('Unable to parse vault token account');
      mint = new PublicKey(parsedInfo.mint);

      payerTokenAccount = await getOrCreateAssociatedTokenAccount(provider.connection, payerSigner, mint, payerPubkey);
    }

    // Perform a deposit
    console.log("Performing deposit...");
    const commitment = new Uint8Array(32);
    commitment[0] = 1;

    const depositTx = await program.methods
      .deposit(new anchor.BN(100), Buffer.from(commitment), null)
      .accounts({
        user: payerPubkey,
        from: payerTokenAccount.address,
        admin: adminPda,
        vault: vaultPda,
        vaultTokenAccount: vaultTokenAccountAddress,
        treeState: treePda,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    console.log("Deposit successful. Tx:", depositTx);

    // Verify tree state updated
    const treeState = await program.account.treeState.fetch(treePda);
    if (Buffer.from(treeState.root).compare(Buffer.from(commitment)) !== 0) {
      throw new Error("Tree root not updated after deposit");
    }
    console.log("Tree root verified after deposit");

    // Verify vault has tokens now
    const vaultBalance = await provider.connection.getTokenAccountBalance(vaultTokenAccountAddress);
    console.log("Vault balance after deposit:", vaultBalance.value.amount);
    if (parseInt(vaultBalance.value.amount) < 100) {
      throw new Error("Vault did not receive tokens");
    }

    console.log("✅ All tests passed!");
  });
});
