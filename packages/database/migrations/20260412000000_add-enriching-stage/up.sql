-- Migration: 20260412000000_add-enriching-stage
-- Author: raacevedo
-- Created: 2026-04-12T00:00:00.000Z

ALTER TYPE "ProcessingStage" ADD VALUE IF NOT EXISTS 'ENRICHING' AFTER 'SUMMARIZED';
