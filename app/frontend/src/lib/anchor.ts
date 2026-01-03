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
  if (!provider || !provider.connection || !provider.wallet) {
    throw new Error('Invalid Anchor provider: provider, connection, or wallet is undefined. Ensure wallet is connected and passed as the anchor wallet.');
  }

  // Extra validation: ensure the wallet has a publicKey and signing methods
  const walletAny = provider.wallet as any;
  if (!walletAny.publicKey || typeof walletAny.signTransaction !== 'function' || typeof walletAny.signAllTransactions !== 'function') {
    throw new Error('Invalid Anchor provider wallet: missing publicKey or signing methods. Make sure your wallet adapter is connected and provides signTransaction/signAllTransactions.');
  }

  // Modern Anchor: use the address from the IDL directly
  try {
    return new Program(idl as Idl, provider) as Program<Idl>;
  } catch (err: any) {
    // Emit helpful debug information to the console for troubleshooting
    console.error('Failed to construct Anchor Program', {
      err: err?.message ?? err,
      provider: {
        wallet: {
          publicKey: walletAny.publicKey?.toString?.(),
          hasSignTransaction: typeof walletAny.signTransaction === 'function',
          hasSignAllTransactions: typeof walletAny.signAllTransactions === 'function',
        },
        connection: {
          endpoint: (provider.connection as any)?.rpcEndpoint ?? (provider.connection as any)?._rpcEndpoint ?? null,
        },
      },
      idlSummary: {
        address: (idl as any)?.address,
        instructions: Array.isArray((idl as any)?.instructions) ? (idl as any).instructions.length : undefined,
      },
    });

    // Re-throw so callers can handle this as before
    throw err;
  }
} 
