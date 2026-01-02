import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import idl from "../idl/payfi.json";
import type { Payfi } from "../types/payfi";

export const DEFAULT_PROVIDER_URL = process.env.NEXT_PUBLIC_ANCHOR_PROVIDER_URL ?? "https://api.devnet.solana.com";
export const PROGRAM_ID = new PublicKey(idl.address);

export function getConnection(): Connection {
  return new Connection(DEFAULT_PROVIDER_URL, "confirmed");
}

export function getAnchorProvider(connection: Connection, wallet: any): AnchorProvider {
  return new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
}

export function getProgram(provider: AnchorProvider): Program<Payfi> {
  // Cast the generic Program to the generated `Payfi` type so callers gain typed
  // method/account signatures from the Anchor-generated types.
  return new Program(idl as Idl, PROGRAM_ID, provider) as Program<Payfi>;
}
