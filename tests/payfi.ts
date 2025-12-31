import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { Payfi } from "../target/types/payfi";

describe("payfi", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.payfi as Program<Payfi>;

  it("initializes state", async () => {
    const provider = anchor.getProvider();
    const payer = provider.wallet.publicKey;

    // derive PDAs
    const [adminPda] = await PublicKey.findProgramAddress([
      Buffer.from("admin")
    ], program.programId);
    const [treePda] = await PublicKey.findProgramAddress([
      Buffer.from("tree_state")
    ], program.programId);
    const [nullsPda] = await PublicKey.findProgramAddress([
      Buffer.from("nullifier_set")
    ], program.programId);
    const [vaultPda] = await PublicKey.findProgramAddress([
      Buffer.from("vault")
    ], program.programId);

    // For now use payer's token account pubkey placeholder (will be real token account in integration tests)
    const dummyVaultTokenAccount = payer;

    const tx = await program.methods
      .initialize(payer, dummyVaultTokenAccount)
      .accounts({
        admin: adminPda,
        treeState: treePda,
        nullifierSet: nullsPda,
        vault: vaultPda,
        payer: payer,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    console.log("Initialize tx:", tx);

    const adminState = await program.account.admin.fetch(adminPda);
    console.log("Admin authority:", adminState.authority.toBase58());
    if (adminState.authority.toBase58() !== payer.toBase58()) {
      throw new Error("Admin not set correctly");
    }
  });
});
