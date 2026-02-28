use anchor_lang::prelude::*;

declare_id!("ZKid1dentityVerif1erProgramXXXXXXXXXXXXXXXX");

#[program]
pub mod zk_verifier {
    use super::*;

    pub fn initialize_verifier(
        ctx: Context<InitializeVerifier>,
        verification_key: [u8; 32],
    ) -> Result<()> {
        let state = &mut ctx.accounts.verifier_state;
        state.authority = ctx.accounts.authority.key();
        state.verification_key = verification_key;
        state.total_verifications = 0;
        state.bump = ctx.bumps.verifier_state;
        Ok(())
    }

    pub fn register_issuer(
        ctx: Context<RegisterIssuer>,
        name: String,
        issuer_pubkey: Pubkey,
    ) -> Result<()> {
        require!(name.len() <= 64, ZkIdentityError::NameTooLong);

        let issuer = &mut ctx.accounts.issuer_account;
        issuer.authority = ctx.accounts.authority.key();
        issuer.name = name;
        issuer.issuer_pubkey = issuer_pubkey;
        issuer.trusted = true;
        issuer.credentials_issued = 0;
        issuer.bump = ctx.bumps.issuer_account;
        Ok(())
    }

    pub fn issue_credential(
        ctx: Context<IssueCredential>,
        credential_type: String,
        commitment: [u8; 32],
        expires_at: i64,
    ) -> Result<()> {
        require!(
            credential_type.len() <= 32,
            ZkIdentityError::InvalidCredentialType
        );
        require!(
            ctx.accounts.issuer_account.trusted,
            ZkIdentityError::UntrustedIssuer
        );

        let credential = &mut ctx.accounts.credential_record;
        credential.issuer = ctx.accounts.issuer_account.key();
        credential.holder = ctx.accounts.holder.key();
        credential.credential_type = credential_type;
        credential.commitment = commitment;
        credential.issued_at = Clock::get()?.unix_timestamp;
        credential.expires_at = expires_at;
        credential.revoked = false;
        credential.bump = ctx.bumps.credential_record;

        let issuer = &mut ctx.accounts.issuer_account;
        issuer.credentials_issued += 1;

        Ok(())
    }

    pub fn revoke_credential(ctx: Context<RevokeCredential>) -> Result<()> {
        let credential = &mut ctx.accounts.credential_record;
        require!(!credential.revoked, ZkIdentityError::AlreadyRevoked);
        credential.revoked = true;
        Ok(())
    }

    pub fn verify_proof(
        ctx: Context<VerifyProof>,
        proof_a: [u8; 64],
        proof_b: [u8; 128],
        proof_c: [u8; 64],
        public_signals: Vec<u8>,
    ) -> Result<bool> {
        let credential = &ctx.accounts.credential_record;
        require!(!credential.revoked, ZkIdentityError::CredentialRevoked);

        let clock = Clock::get()?;
        require!(
            credential.expires_at > clock.unix_timestamp,
            ZkIdentityError::CredentialExpired
        );

        // Simplified proof verification - in production would use full Groth16
        let valid = verify_groth16_proof(&proof_a, &proof_b, &proof_c, &public_signals);

        if valid {
            let state = &mut ctx.accounts.verifier_state;
            state.total_verifications += 1;

            let verification = &mut ctx.accounts.verification_record;
            verification.credential = ctx.accounts.credential_record.key();
            verification.verifier = ctx.accounts.verifier.key();
            verification.verified_at = clock.unix_timestamp;
            verification.proof_hash =
                anchor_lang::solana_program::keccak::hash(&public_signals).0;
            verification.bump = ctx.bumps.verification_record;
        }

        emit!(ProofVerified {
            credential: ctx.accounts.credential_record.key(),
            verifier: ctx.accounts.verifier.key(),
            valid,
            timestamp: clock.unix_timestamp,
        });

        Ok(valid)
    }
}

// PLACEHOLDER: Structural validity check only.
// ⚠️  WARNING: This function does NOT perform cryptographic Groth16 pairing verification.
//     It only checks that the proof byte arrays are non-empty.
//     Before any production or mainnet deployment, replace this with a full
//     Groth16 on-chain verifier using BN254 elliptic-curve pairing checks.
//     A production implementation should use a pre-compiled verifier generated
//     by `snarkjs generateverifier` or an equivalent Solana-compatible library.
fn verify_groth16_proof(
    proof_a: &[u8; 64],
    proof_b: &[u8; 128],
    proof_c: &[u8; 64],
    public_signals: &[u8],
) -> bool {
    proof_a.iter().any(|&b| b != 0)
        && proof_b.iter().any(|&b| b != 0)
        && proof_c.iter().any(|&b| b != 0)
        && !public_signals.is_empty()
}

#[derive(Accounts)]
pub struct InitializeVerifier<'info> {
    #[account(
        init,
        payer = authority,
        space = VerifierState::LEN,
        seeds = [b"verifier_state"],
        bump
    )]
    pub verifier_state: Account<'info, VerifierState>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String, issuer_pubkey: Pubkey)]
pub struct RegisterIssuer<'info> {
    #[account(
        init,
        payer = authority,
        space = IssuerAccount::LEN,
        seeds = [b"issuer", issuer_pubkey.as_ref()],
        bump
    )]
    pub issuer_account: Account<'info, IssuerAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(credential_type: String, commitment: [u8; 32], expires_at: i64)]
pub struct IssueCredential<'info> {
    #[account(
        init,
        payer = authority,
        space = CredentialRecord::LEN,
        seeds = [b"credential", holder.key().as_ref(), commitment.as_ref()],
        bump
    )]
    pub credential_record: Account<'info, CredentialRecord>,

    #[account(
        mut,
        seeds = [b"issuer", issuer_account.issuer_pubkey.as_ref()],
        bump = issuer_account.bump,
        has_one = authority @ ZkIdentityError::Unauthorized,
    )]
    pub issuer_account: Account<'info, IssuerAccount>,

    /// CHECK: Holder's public key - only used as a seed and stored reference
    pub holder: AccountInfo<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeCredential<'info> {
    #[account(
        mut,
        constraint = issuer_account.key() == credential_record.issuer @ ZkIdentityError::Unauthorized
    )]
    pub credential_record: Account<'info, CredentialRecord>,

    #[account(
        seeds = [b"issuer", issuer_account.issuer_pubkey.as_ref()],
        bump = issuer_account.bump,
        has_one = authority @ ZkIdentityError::Unauthorized,
    )]
    pub issuer_account: Account<'info, IssuerAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(proof_a: [u8; 64], proof_b: [u8; 128], proof_c: [u8; 64], public_signals: Vec<u8>)]
pub struct VerifyProof<'info> {
    #[account(
        mut,
        seeds = [b"verifier_state"],
        bump = verifier_state.bump,
    )]
    pub verifier_state: Account<'info, VerifierState>,

    pub credential_record: Account<'info, CredentialRecord>,

    #[account(
        init,
        payer = verifier,
        space = VerificationRecord::LEN,
        seeds = [b"verification", credential_record.key().as_ref(), verifier.key().as_ref()],
        bump
    )]
    pub verification_record: Account<'info, VerificationRecord>,

    #[account(mut)]
    pub verifier: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct VerifierState {
    pub authority: Pubkey,
    pub verification_key: [u8; 32],
    pub total_verifications: u64,
    pub bump: u8,
}

impl VerifierState {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 1;
}

#[account]
pub struct IssuerAccount {
    pub authority: Pubkey,
    pub name: String, // max 64 chars
    pub issuer_pubkey: Pubkey,
    pub trusted: bool,
    pub credentials_issued: u64,
    pub bump: u8,
}

impl IssuerAccount {
    pub const LEN: usize = 8 + 32 + (4 + 64) + 32 + 1 + 8 + 1;
}

#[account]
pub struct CredentialRecord {
    pub issuer: Pubkey,
    pub holder: Pubkey,
    pub credential_type: String, // max 32 chars
    pub commitment: [u8; 32],
    pub issued_at: i64,
    pub expires_at: i64,
    pub revoked: bool,
    pub bump: u8,
}

impl CredentialRecord {
    pub const LEN: usize = 8 + 32 + 32 + (4 + 32) + 32 + 8 + 8 + 1 + 1;
}

#[account]
pub struct VerificationRecord {
    pub credential: Pubkey,
    pub verifier: Pubkey,
    pub verified_at: i64,
    pub proof_hash: [u8; 32],
    pub bump: u8,
}

impl VerificationRecord {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 32 + 1;
}

#[event]
pub struct ProofVerified {
    pub credential: Pubkey,
    pub verifier: Pubkey,
    pub valid: bool,
    pub timestamp: i64,
}

#[error_code]
pub enum ZkIdentityError {
    #[msg("Unauthorized: caller is not the authority")]
    Unauthorized,
    #[msg("Issuer is not trusted")]
    UntrustedIssuer,
    #[msg("Credential has been revoked")]
    CredentialRevoked,
    #[msg("Credential has expired")]
    CredentialExpired,
    #[msg("Credential is already revoked")]
    AlreadyRevoked,
    #[msg("Name too long (max 64 chars)")]
    NameTooLong,
    #[msg("Invalid credential type (max 32 chars)")]
    InvalidCredentialType,
    #[msg("Invalid proof format")]
    InvalidProof,
}
