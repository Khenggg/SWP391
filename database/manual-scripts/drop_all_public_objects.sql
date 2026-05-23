-- DANGER: Destructive reset script for PostgreSQL/Supabase.
-- This removes project data and schema objects in the public schema, including tables.
-- Run only when you intentionally want to rebuild the database from database/01_schema.sql.
--
-- It keeps the database itself, roles, extensions, and non-public schemas.
-- Recommended run order after this script:
--   1. database/01_schema.sql
--   2. database/02_seed.sql
--   3. database/03_indexes_constraints.sql

BEGIN;

-- Drop views first so table drops are straightforward.
DO $$
DECLARE
    object_record RECORD;
BEGIN
    FOR object_record IN
        SELECT schemaname, viewname
        FROM pg_views
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format(
            'DROP VIEW IF EXISTS %I.%I CASCADE',
            object_record.schemaname,
            object_record.viewname
        );
    END LOOP;
END $$;

DO $$
DECLARE
    object_record RECORD;
BEGIN
    FOR object_record IN
        SELECT schemaname, matviewname
        FROM pg_matviews
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format(
            'DROP MATERIALIZED VIEW IF EXISTS %I.%I CASCADE',
            object_record.schemaname,
            object_record.matviewname
        );
    END LOOP;
END $$;

-- Drop all project tables. CASCADE also removes triggers, indexes, constraints, and dependent FKs.
DO $$
DECLARE
    object_record RECORD;
BEGIN
    FOR object_record IN
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format(
            'DROP TABLE IF EXISTS %I.%I CASCADE',
            object_record.schemaname,
            object_record.tablename
        );
    END LOOP;
END $$;

-- Drop leftover sequences that were not owned by dropped tables.
DO $$
DECLARE
    object_record RECORD;
BEGIN
    FOR object_record IN
        SELECT sequence_schema, sequence_name
        FROM information_schema.sequences
        WHERE sequence_schema = 'public'
    LOOP
        EXECUTE format(
            'DROP SEQUENCE IF EXISTS %I.%I CASCADE',
            object_record.sequence_schema,
            object_record.sequence_name
        );
    END LOOP;
END $$;

-- Drop custom routines in public, but keep extension-owned routines such as pgcrypto.
DO $$
DECLARE
    object_record RECORD;
BEGIN
    FOR object_record IN
        SELECT
            n.nspname AS schema_name,
            p.proname AS routine_name,
            pg_get_function_identity_arguments(p.oid) AS routine_args
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
          AND NOT EXISTS (
              SELECT 1
              FROM pg_depend d
              WHERE d.objid = p.oid
                AND d.deptype = 'e'
          )
    LOOP
        EXECUTE format(
            'DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE',
            object_record.schema_name,
            object_record.routine_name,
            object_record.routine_args
        );
    END LOOP;
END $$;

-- Drop custom types/domains in public, while preserving extension-owned objects.
DO $$
DECLARE
    object_record RECORD;
BEGIN
    FOR object_record IN
        SELECT
            n.nspname AS schema_name,
            t.typname AS type_name,
            t.typtype AS type_kind
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
          AND t.typtype IN ('c', 'd', 'e', 'r')
          AND NOT EXISTS (
              SELECT 1
              FROM pg_depend d
              WHERE d.objid = t.oid
                AND d.deptype = 'e'
          )
    LOOP
        IF object_record.type_kind = 'd' THEN
            EXECUTE format(
                'DROP DOMAIN IF EXISTS %I.%I CASCADE',
                object_record.schema_name,
                object_record.type_name
            );
        ELSE
            EXECUTE format(
                'DROP TYPE IF EXISTS %I.%I CASCADE',
                object_record.schema_name,
                object_record.type_name
            );
        END IF;
    END LOOP;
END $$;

COMMIT;
