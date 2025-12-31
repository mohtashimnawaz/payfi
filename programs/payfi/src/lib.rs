use anchor_lang::prelude::*;

declare_id!("HotZhiJzwDN9BPVxbxWDDEYhZeRUGt2uLvj9uiwmav9f");

#[program]
pub mod payfi {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
