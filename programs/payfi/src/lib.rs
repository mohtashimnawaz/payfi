use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Transfer, Token};

declare_id!("HotZhiJzwDN9BPVxbxWDDEYhZeRUGt2uLvj9uiwmav9f");

pub const VAULT_SEED: &[u8] = b"vault";
pub const TREE_STATE_SEED: &[u8] = b"tree_state";
pub const NULLIFIER_SET_SEED: &[u8] = b"nullifier_set";
pub const ADMIN_SEED: &[u8] = b"admin";

#[program]
pub mod payfi {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, admin: Pubkey, vault_token_account: Pubkey) -> Result<()> {
        let admin_account = &mut ctx.accounts.admin;
        admin_account.authority = admin;
        admin_account.deny_list = vec![];

        let vault_account = &mut ctx.accounts.vault;
        vault_account.token_account = vault_token_account;

        let tree = &mut ctx.accounts.tree_state;
        tree.root = [0u8;32];

        let nulls = &mut ctx.accounts.nullifier_set;
        nulls.nullifiers = vec![];

        msg!("PayFi initialized by: {:?}", admin);

        msg!("PayFi initialized by: {:?}", admin);
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64, commitment: [u8;32], encrypted_note: Option<Vec<u8>>) -> Result<()> {
        // Transfer tokens from user to vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.from.to_account_info(),
            to: ctx.accounts.vault_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        token::transfer(CpiContext::new(cpi_program, cpi_accounts), amount)?;

        // TODO: integrate with Light ZK Compression / append commitment
        ctx.accounts.tree_state.root = commitment; // placeholder behaviour

        // Emit encrypted note event (for auditors with view keys)
        if let Some(enc) = encrypted_note {
            emit!(EncryptedNoteEvent { commitment, encrypted: enc });
        } else {
            emit!(EncryptedNoteEvent { commitment, encrypted: vec![] });
        }

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, proof: Vec<u8>, nullifier: [u8;32], root: [u8;32], amount: u64) -> Result<()> {
        // TODO: Verify proof (Noir verifier integration)
        // For now, ensure provided root matches on-chain root
        require!(ctx.accounts.tree_state.root == root, ErrorCode::RootMismatch);

        // Ensure nullifier not used
        let nullifier_set = &mut ctx.accounts.nullifier_set;
        for n in nullifier_set.nullifiers.iter() {
            require!(n != &nullifier, ErrorCode::NullifierAlreadyUsed);
        }
        nullifier_set.nullifiers.push(nullifier);

        // Transfer tokens from vault to recipient token account
        let vault_seeds: &[&[u8]] = &[VAULT_SEED, &[ctx.accounts.vault.bump]];
        let signer_seeds: &[&[&[u8]]] = &[vault_seeds];

        let cpi_accounts = Transfer {
            from: ctx.accounts.vault_token_account.to_account_info(),
            to: ctx.accounts.recipient_token_account.to_account_info(),
            authority: ctx.accounts.vault.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        token::transfer(CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds), amount)?;

        emit!(WithdrawEvent { nullifier });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(admin: Pubkey)]
pub struct Initialize<'info> {
    #[account(init, payer = payer, space = 8 + 32 + (4 + 32 * 10), seeds = [ADMIN_SEED], bump)]
    pub admin: Account<'info, Admin>,
    #[account(init, payer = payer, space = 8 + 32 + 1, seeds = [TREE_STATE_SEED], bump)]
    pub tree_state: Account<'info, TreeState>,
    #[account(init, payer = payer, space = 8 + (4 + 32 * 100), seeds = [NULLIFIER_SET_SEED], bump)]
    pub nullifier_set: Account<'info, NullifierSet>,
    #[account(init, payer = payer, space = 8 + 32 + 1, seeds = [VAULT_SEED], bump)]
    pub vault: Account<'info, Vault>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut, constraint = from.owner == user.key())]
    pub from: Account<'info, TokenAccount>,

    /// CHECK: vault PDA account - authority for transfers
    #[account(mut)]
    pub vault: Account<'info, Vault>,

    #[account(mut, address = vault.token_account)]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub tree_state: Account<'info, TreeState>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    /// CHECK: proof verification is done off-chain for now
    pub authority: Signer<'info>,

    #[account(mut, seeds = [NULLIFIER_SET_SEED], bump = nullifier_set.bump)]
    pub nullifier_set: Account<'info, NullifierSet>,

    /// CHECK: vault PDA
    #[account(mut, seeds = [VAULT_SEED], bump = vault.bump)]
    pub vault: Account<'info, Vault>,

    #[account(mut, address = vault.token_account)]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,

    #[account(mut, seeds = [TREE_STATE_SEED], bump = tree_state.bump)]
    pub tree_state: Account<'info, TreeState>,

    pub token_program: Program<'info, Token>,
}

#[account]
pub struct Vault {
    pub token_account: Pubkey,
    pub bump: u8,
}

#[account]
pub struct TreeState {
    pub root: [u8;32],
    pub bump: u8,
}

#[account]
pub struct NullifierSet {
    pub nullifiers: Vec<[u8;32]>,
    pub bump: u8,
}

#[account]
pub struct Admin {
    pub authority: Pubkey,
    pub deny_list: Vec<Pubkey>,
    pub bump: u8,
}

#[event]
pub struct EncryptedNoteEvent {
    pub commitment: [u8;32],
    pub encrypted: Vec<u8>,
}

#[event]
pub struct WithdrawEvent {
    pub nullifier: [u8;32],
}

#[error_code]
pub enum ErrorCode {
    #[msg("Provided root does not match the on-chain root")]
    RootMismatch,
    #[msg("Nullifier already used")]
    NullifierAlreadyUsed,
}
