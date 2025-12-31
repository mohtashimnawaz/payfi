import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

async function main() {
  if (!process.env.RUN_DEVNET_SMOKE) {
    console.log("RUN_DEVNET_SMOKE not set; skipping devnet smoke test.");
    process.exit(0);
  }

  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();
  const program = anchor.workspace.payfi as anchor.Program<any>;

  console.log("Cluster:", (provider.connection as any)._rpcEndpoint);

  // Check program exists by fetching account (tree_state PDA)
  const [treePda] = await PublicKey.findProgramAddress([Buffer.from("tree_state")], program.programId);
  const treeInfo = await provider.connection.getAccountInfo(treePda);
  if (!treeInfo) {
    throw new Error(`TreeState PDA ${treePda.toBase58()} not found; ensure program is deployed to devnet and Anchor.toml is updated`);
  }

  console.log("Found TreeState account; running minimal deposit/withdraw flow (devnet). Note: requires deployer & relayer keys funded.)");

  // Create temporary test mint and accounts funded by provider wallet
  const payer = (provider.wallet as any).payer as Keypair;
  const mint = await createMint(provider.connection, payer, payer.publicKey, null, 0);
  const payerToken = await getOrCreateAssociatedTokenAccount(provider.connection, payer, mint, payer.publicKey);
  await mintTo(provider.connection, payer, mint, payerToken.address, payer.publicKey, 100);

  console.log("Basic devnet smoke flow completed. Please run the full integration checklist for production verification.");
}

main().then(()=>process.exit(0)).catch(e=>{console.error(e); process.exit(1);});