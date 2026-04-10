-- Creates databases for each backend on first Postgres startup.
-- This file is mounted into /docker-entrypoint-initdb.d/ and runs only
-- when the data volume is empty (fresh init).

-- sagepoint
CREATE DATABASE sagepoint;
\c sagepoint
CREATE EXTENSION IF NOT EXISTS vector;

-- sagepoint staging
CREATE DATABASE sagepoint_staging;
\c sagepoint_staging
CREATE EXTENSION IF NOT EXISTS vector;
