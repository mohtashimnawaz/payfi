import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

async function main() {
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();
  const program = anchor.workspace.payfi as anchor.Program<any>;

  const payer = (provider.wallet as any).payer as Keypair;
  console.log("Provider:", (provider.connection as any)._rpcEndpoint);
  console.log("Payer:", payer.publicKey.toBase58());

  // Create a temporary mint and token account for the vault
  console.log("Creating temp mint and token account...");
  const mint = await createMint(provider.connection, payer, payer.publicKey, null, 0);
  const payerToken = await getOrCreateAssociatedTokenAccount(provider.connection, payer, mint, payer.publicKey);
  await mintTo(provider.connection, payer, mint, payerToken.address, payer.publicKey, 100);

  // Derive PDAs and bumps
  const [adminPda, adminBump] = await PublicKey.findProgramAddress([Buffer.from("admin")], program.programId);
  const [treePda, treeBump] = await PublicKey.findProgramAddress([Buffer.from("tree_state")], program.programId);
  const [managerPda, managerBump] = await PublicKey.findProgramAddress([Buffer.from("nullifier_manager")], program.programId);
  const [vaultPda, vaultBump] = await PublicKey.findProgramAddress([Buffer.from("vault")], program.programId);

  console.log("PDAs:", {
    admin: adminPda.toBase58(),
    tree: treePda.toBase58(),
    manager: managerPda.toBase58(),
    vault: vaultPda.toBase58(),
  });

  // Call initialize on-chain
  console.log("Sending initialize transaction...");

  const tx = await program.methods
    .initialize(payer.publicKey, payerToken.address, vaultBump, treeBump, new anchor.BN(4), adminBump)
    .accounts({
      admin: adminPda,
      tree_state: treePda,
      nullifier_manager: managerPda,
      vault: vaultPda,
      payer: payer.publicKey,
      system_program: anchor.web3.SystemProgram.programId,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    })
    .rpc();

  console.log("Initialize tx signature:", tx);
  console.log("Done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
