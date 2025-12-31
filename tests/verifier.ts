import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair } from "@solana/web3.js";
import { Verifier } from "../target/types/verifier";

describe("verifier", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.verifier as Program<Verifier>;

  it("accepts valid magic proof", async () => {
    const payer = anchor.getProvider().wallet.publicKey;
    // call verify with magic
    await program.methods.verify(Buffer.from([1]), Buffer.from([1])).accounts({ programAccount: payer }).rpc();
  });

  it("accepts fallback VALID proof", async () => {
    const payer = anchor.getProvider().wallet.publicKey;
    await program.methods.verify(Buffer.from("VALID"), null).accounts({ programAccount: payer }).rpc();
  });
});
