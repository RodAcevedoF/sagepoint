-- Migration: 20260401000000_add-invitations (ROLLBACK)
-- Author: raacevedo

DROP TABLE IF EXISTS "invitations";
DROP TYPE IF EXISTS "InvitationStatus";
