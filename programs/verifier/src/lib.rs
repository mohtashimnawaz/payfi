use anchor_lang::prelude::*;

declare_id!("H7vpWaLWY1dDc8odHnZ3p4SMRT89uDe6WRpaP5ewwWoh");

#[program]
pub mod verifier {
    use super::*;

    // Simple on-chain verifier for devnet/dev testing. In production,
    // this should be replaced with a proper Noir/Plonk verifier.
    pub fn verify(_ctx: Context<Verify>, proof: Vec<u8>, magic: Option<Vec<u8>>) -> Result<()> {
        // If magic supplied, accept proof only if proof == magic
        if let Some(m) = magic {
            require!(proof == m, ErrorCode::InvalidProof);
            msg!("Verifier: proof matched magic");
            return Ok(());
        }

        // Otherwise accept if proof equals 'VALID' bytes
        if proof == b"VALID".to_vec() {
            msg!("Verifier: proof valid (fallback)");
            Ok(())
        } else {
            Err(ErrorCode::InvalidProof.into())
        }
    }
}

#[derive(Accounts)]
pub struct Verify<'info> {
    /// CHECK: Verifier has no state for now
    pub program_account: UncheckedAccount<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid proof")]
    InvalidProof,
}
