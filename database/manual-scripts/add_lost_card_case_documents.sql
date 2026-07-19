CREATE TABLE IF NOT EXISTS lost_card_case_documents (
    id BIGSERIAL PRIMARY KEY,
    lost_card_case_id BIGINT NOT NULL REFERENCES lost_card_cases(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_path TEXT NOT NULL,
    thumbnail_path TEXT,
    original_file_name VARCHAR(255),
    mime_type VARCHAR(100),
    size_bytes BIGINT,
    sha256_hash VARCHAR(100),
    note TEXT,
    is_sensitive BOOLEAN NOT NULL DEFAULT true,
    uploaded_by BIGINT NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE lost_card_case_documents DROP CONSTRAINT IF EXISTS ck_lost_card_documents_type;
ALTER TABLE lost_card_case_documents
    ADD CONSTRAINT ck_lost_card_documents_type
    CHECK (document_type IN (
        'CCCD_FRONT',
        'CCCD_BACK',
        'FACE_PHOTO',
        'VEHICLE_PHOTO',
        'LOSS_DECLARATION',
        'SIGNED_FORM',
        'OTHER'
    ));

ALTER TABLE lost_card_case_documents DROP CONSTRAINT IF EXISTS ck_lost_card_documents_file_path;
ALTER TABLE lost_card_case_documents
    ADD CONSTRAINT ck_lost_card_documents_file_path
    CHECK (NULLIF(BTRIM(file_path), '') IS NOT NULL);

ALTER TABLE lost_card_case_documents DROP CONSTRAINT IF EXISTS ck_lost_card_documents_size;
ALTER TABLE lost_card_case_documents
    ADD CONSTRAINT ck_lost_card_documents_size
    CHECK (size_bytes IS NULL OR size_bytes >= 0);

CREATE INDEX IF NOT EXISTS ix_lost_card_documents_case
ON lost_card_case_documents(lost_card_case_id);

CREATE INDEX IF NOT EXISTS ix_lost_card_documents_type
ON lost_card_case_documents(document_type);

CREATE INDEX IF NOT EXISTS ix_lost_card_documents_uploaded_at
ON lost_card_case_documents(uploaded_at);

CREATE INDEX IF NOT EXISTS ix_lost_card_documents_active_case
ON lost_card_case_documents(lost_card_case_id)
WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_lost_card_documents_active_case_type
ON lost_card_case_documents(lost_card_case_id, document_type)
WHERE deleted_at IS NULL AND document_type <> 'OTHER';

CREATE OR REPLACE TRIGGER trg_lost_card_case_documents_set_updated_at
BEFORE UPDATE ON lost_card_case_documents
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
