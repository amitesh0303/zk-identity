-- ZK-Identity Database Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Credential issuers (trusted entities)
CREATE TABLE IF NOT EXISTS issuers (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          VARCHAR(64) NOT NULL,
    public_key    VARCHAR(44) NOT NULL UNIQUE,
    trusted       BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Issued credentials
CREATE TABLE IF NOT EXISTS credentials (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    holder_public_key  VARCHAR(44) NOT NULL,
    credential_type    VARCHAR(32) NOT NULL
                         CHECK (credential_type IN ('age_verification', 'citizenship', 'income')),
    commitment         CHAR(64) NOT NULL UNIQUE,   -- hex-encoded 32-byte Poseidon hash
    issued_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at         TIMESTAMPTZ NOT NULL,
    revoked            BOOLEAN NOT NULL DEFAULT false,
    issuer_signature   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_credentials_holder
    ON credentials (holder_public_key);

CREATE INDEX IF NOT EXISTS idx_credentials_commitment
    ON credentials (commitment);

-- Proof verification records
CREATE TABLE IF NOT EXISTS verifications (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credential_id       UUID NOT NULL REFERENCES credentials(id),
    verifier_public_key VARCHAR(44) NOT NULL,
    valid               BOOLEAN NOT NULL,
    verified_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verifications_credential
    ON verifications (credential_id);

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
    id          BIGSERIAL PRIMARY KEY,
    action      VARCHAR(64) NOT NULL,
    entity_id   UUID,
    actor       VARCHAR(44),
    metadata    JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
