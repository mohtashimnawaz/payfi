use anchor_lang::prelude::*;
use anchor_spl::token::{self, TokenAccount, Transfer, Token};
use anchor_lang::solana_program::{instruction::Instruction, program::invoke};

declare_id!("HotZhiJzwDN9BPVxbxWDDEYhZeRUGt2uLvj9uiwmav9f");

pub const VAULT_SEED: &[u8] = b"vault";
pub const TREE_STATE_SEED: &[u8] = b"tree_state";
pub const NULLIFIER_SET_SEED: &[u8] = b"nullifier_set";
pub const NULLIFIER_CHUNK_SEED: &[u8] = b"nullifier_chunk";
pub const ADMIN_SEED: &[u8] = b"admin";

#[program]
pub mod payfi {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, admin: Pubkey, vault_token_account: Pubkey, vault_bump: u8, tree_bump: u8, nullifier_bump: u8, admin_bump: u8) -> Result<()> {
        let admin_account = &mut ctx.accounts.admin;
        admin_account.authority = admin;
        admin_account.deny_list = vec![];
        admin_account.verifier_mode = 0u8; // 0 = off, 1 = stub
        admin_account.verifier_magic = vec![];
        admin_account.paused = false;
        admin_account.bump = admin_bump;

        let vault_account = &mut ctx.accounts.vault;
        vault_account.token_account = vault_token_account;
        vault_account.bump = vault_bump;

        let tree = &mut ctx.accounts.tree_state;
        tree.root = [0u8;32];
        tree.bump = tree_bump;

        let nulls = &mut ctx.accounts.nullifier_set;
        nulls.nullifiers = vec![];
        nulls.bump = nullifier_bump;

        // No chunks created by default; use `init_nullifier_chunk` to create chunk accounts on-demand

        msg!("PayFi initialized by: {:?}", admin);
        Ok(())
    }

    pub fn set_verifier_mode(ctx: Context<SetVerifierMode>, mode: u8, magic: Option<Vec<u8>>) -> Result<()> {
        let admin = &mut ctx.accounts.admin;
        require!(ctx.accounts.authority.key() == admin.authority, ErrorCode::Unauthorized);
        admin.verifier_mode = mode;
        admin.verifier_magic = magic.unwrap_or_default();
        Ok(())
    }

    pub fn add_to_denylist(ctx: Context<ModifyDenyList>, addr: Pubkey) -> Result<()> {
        let admin = &mut ctx.accounts.admin;
        require!(ctx.accounts.authority.key() == admin.authority, ErrorCode::Unauthorized);
        if !admin.deny_list.iter().any(|a| a == &addr) {
            admin.deny_list.push(addr);
        }
        Ok(())
    }

    pub fn remove_from_denylist(ctx: Context<ModifyDenyList>, addr: Pubkey) -> Result<()> {
        let admin = &mut ctx.accounts.admin;
        require!(ctx.accounts.authority.key() == admin.authority, ErrorCode::Unauthorized);
        admin.deny_list.retain(|a| a != &addr);
        Ok(())
    }

    pub fn set_pause(ctx: Context<SetPause>, paused: bool) -> Result<()> {
        let admin = &mut ctx.accounts.admin;
        require!(ctx.accounts.authority.key() == admin.authority, ErrorCode::Unauthorized);
        admin.paused = paused;
        Ok(())
    }

    /// Initialize a Nullifier chunk account for a specific chunk index.
    pub fn init_nullifier_chunk(ctx: Context<InitNullifierChunk>, index: u64) -> Result<()> {
        let chunk = &mut ctx.accounts.chunk;
        chunk.index = index;
        chunk.bitmap = [0u8; 32];
        // leave bump at default; clients can derive bump if needed
        chunk.bump = 0u8;
        Ok(())
    }

    /// Update the on-chain merkle/compression root (Light Compression stub)
    pub fn update_root(ctx: Context<UpdateRoot>, new_root: [u8;32]) -> Result<()> {
        let admin = &ctx.accounts.admin;
        require!(ctx.accounts.authority.key() == admin.authority, ErrorCode::Unauthorized);
        let tree = &mut ctx.accounts.tree_state;
        tree.root = new_root;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64, commitment: [u8;32], encrypted_note: Option<Vec<u8>>) -> Result<()> {
        // Deny-list check: disallow depositors on deny list
        let admin = &ctx.accounts.admin;
        require!(!admin.deny_list.iter().any(|a| a == &ctx.accounts.user.key()), ErrorCode::DenyListBlocked);

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
        let admin = &mut ctx.accounts.admin;
        // pause check
        require!(!admin.paused, ErrorCode::ContractPaused);

        // recipient deny-list check
        require!(!admin.deny_list.iter().any(|a| a == &ctx.accounts.recipient_token_account.owner), ErrorCode::DenyListBlocked);

        // Verify root
        require!(ctx.accounts.tree_state.root == root, ErrorCode::RootMismatch);

        // Proof verification paths:
        // mode 1: internal stub (proof must match magic)
        // mode 2: CPI to verifier program
        if admin.verifier_mode == 1u8 {
            require!(admin.verifier_magic.len() > 0 && proof == admin.verifier_magic, ErrorCode::InvalidProof);
        } else if admin.verifier_mode == 2u8 {
            // CPI to verifier program
            let verifier = ctx.accounts.verifier_program.as_ref().ok_or(ErrorCode::InvalidProof)?;
            let ix = Instruction::new_with_borsh(
                verifier.key(),
                &(proof.clone(), admin.verifier_magic.clone()),
                vec![],
            );
            invoke(&ix, &[verifier.to_account_info()])?;
        } else {
            // when off, require non-empty proof (placeholder)
            require!(proof.len() > 0, ErrorCode::InvalidProof);
        }

        // Nullifier chunk check and atomic mark
        let chunk = &mut ctx.accounts.nullifier_chunk;
        // compute expected chunk index / bit index from nullifier prefix
        let prefix_bytes: [u8;8] = nullifier[0..8].try_into().unwrap();
        let prefix = u64::from_le_bytes(prefix_bytes);
        let chunk_index = prefix / 256u64;
        let bit_index = (prefix % 256u64) as usize;
        require!(chunk.index == chunk_index, ErrorCode::NullifierAlreadyUsed); // chunk mismatch treated as used
        let byte_idx = bit_index / 8;
        let bit_mask = 1u8 << (bit_index % 8);
        require!(chunk.bitmap[byte_idx] & bit_mask == 0, ErrorCode::NullifierAlreadyUsed);
        // mark bit
        chunk.bitmap[byte_idx] |= bit_mask;

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
    #[account(init, payer = payer, space = 8 + 32 + (4 + 32 * 10) + 1 + (4 + 64), seeds = [ADMIN_SEED], bump)]
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

    #[account(mut, seeds = [ADMIN_SEED], bump = admin.bump)]
    pub admin: Account<'info, Admin>,

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

    #[account(mut, seeds = [ADMIN_SEED], bump = admin.bump, has_one = authority)]
    pub admin: Account<'info, Admin>,

    /// CHECK: vault PDA
    #[account(mut, seeds = [VAULT_SEED], bump = vault.bump)]
    pub vault: Account<'info, Vault>,

    #[account(mut, address = vault.token_account)]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,

    #[account(mut, seeds = [TREE_STATE_SEED], bump = tree_state.bump)]
    pub tree_state: Account<'info, TreeState>,

    /// Nullifier chunk corresponding to the nullifier being spent
    #[account(mut)]
    pub nullifier_chunk: Account<'info, NullifierChunk>,

    /// CHECK: Verifier program account (for CPI when verifier_mode == 2). Program id only, no account validation.
    pub verifier_program: Option<UncheckedAccount<'info>>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SetVerifierMode<'info> {
    #[account(mut, seeds = [ADMIN_SEED], bump = admin.bump, has_one = authority)]
    pub admin: Account<'info, Admin>,
    pub authority: Signer<'info>,
    /// When using mode=2 (CPI), pass the verifier program account
    pub verifier_program: Option<UncheckedAccount<'info>>,
}

#[derive(Accounts)]
#[instruction(index: u64)]
pub struct InitNullifierChunk<'info> {
    #[account(init, payer = payer, space = 8 + 8 + 32 + 1, seeds = [NULLIFIER_CHUNK_SEED, &index.to_le_bytes()], bump)]
    pub chunk: Account<'info, NullifierChunk>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateRoot<'info> {
    #[account(mut, seeds = [ADMIN_SEED], bump = admin.bump, has_one = authority)]
    pub admin: Account<'info, Admin>,
    pub authority: Signer<'info>,
    #[account(mut, seeds = [TREE_STATE_SEED], bump = tree_state.bump)]
    pub tree_state: Account<'info, TreeState>,
}

#[derive(Accounts)]
pub struct ModifyDenyList<'info> {
    #[account(mut, seeds = [ADMIN_SEED], bump = admin.bump, has_one = authority)]
    pub admin: Account<'info, Admin>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetPause<'info> {
    #[account(mut, seeds = [ADMIN_SEED], bump = admin.bump, has_one = authority)]
    pub admin: Account<'info, Admin>,
    pub authority: Signer<'info>,
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
    // kept for backward compat / bookkeeping; nullifier chunks are preferred
    pub nullifiers: Vec<[u8;32]>,
    pub bump: u8,
}

#[account]
pub struct NullifierChunk {
    pub index: u64,
    pub bitmap: [u8;32], // 256 bits per chunk
    pub bump: u8,
}

#[account]
pub struct Admin {
    pub authority: Pubkey,
    pub deny_list: Vec<Pubkey>,
    pub verifier_mode: u8,
    pub verifier_magic: Vec<u8>,
    pub paused: bool,
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
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Address is on deny list")]
    DenyListBlocked,
    #[msg("Invalid proof")]
    InvalidProof,
    #[msg("Contract is paused")]
    ContractPaused,
}
