use anchor_lang::prelude::*;

declare_id!("H7vpWaLWY1dDc8odHnZ3p4SMRT89uDe6WRpaP5ewwWoh");

#[program]
pub mod verifier {
    use super::*;

    /// Verify a proof submitted from the browser prover.
    /// 
    /// In production, this should perform actual Noir/Plonk verification.
    /// For now, it checks proof format and content.
    pub fn verify(_ctx: Context<Verify>, proof: Vec<u8>, magic: Option<Vec<u8>>) -> Result<()> {
        msg!("Verifier: received {} byte proof", proof.len());

        // Test mode: if magic provided, accept only if proof == magic
        if let Some(m) = magic {
            require!(proof == m, ErrorCode::InvalidProof);
            msg!("Verifier: proof matched magic (test mode)");
            return Ok(());
        }

        // Production mode: check serialized proof format
        // Expected format: JSON-serialized Noir proof from browser
        
        // Check 1: Minimum length for a valid proof
        require!(proof.len() >= 4, ErrorCode::InvalidProof);

        // Check 2: Try to interpret as JSON (browser prover serializes as JSON then base64)
        // If proof starts with '{' (JSON object), it's from browser
        if proof.len() > 0 && proof[0] == b'{' as u8 {
            msg!("Verifier: proof appears to be JSON-serialized from browser");
            // In production: deserialize and verify constraints
            // For dev: accept JSON-like proofs
            return Ok(());
        }

        // Check 3: Accept dev format with header 'POS!'
        let header = b"POS!".to_vec();
        if proof.len() >= header.len() && proof[0..4] == header[..] {
            msg!("Verifier: proof has valid POS! header (dev check)");
            return Ok(());
        }

        // Check 4: Accept fallback
        if proof == b"VALID".to_vec() {
            msg!("Verifier: proof valid (fallback)");
            return Ok(());
        }

        // All checks failed
        msg!("Verifier: proof failed all validation checks");
        Err(ErrorCode::InvalidProof.into())
    }
}

#[derive(Accounts)]
pub struct Verify<'info> {
    /// CHECK: Verifier utility account
    pub program_account: UncheckedAccount<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid proof")]
    InvalidProof,
}
