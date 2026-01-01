import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import idl from "../idl/payfi.json";

export const DEFAULT_PROVIDER_URL = process.env.NEXT_PUBLIC_ANCHOR_PROVIDER_URL ?? "https://api.devnet.solana.com";
export const PROGRAM_ID = new PublicKey(idl.address);

export function getConnection(): Connection {
  return new Connection(DEFAULT_PROVIDER_URL, "confirmed");
}

export function getAnchorProvider(connection: Connection, wallet: any): AnchorProvider {
  return new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
}

export function getProgram(provider: AnchorProvider): Program<Idl> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return new Program(idl as Idl, PROGRAM_ID, provider);
}
