-- Creates databases for each backend on first Postgres startup.
-- This file is mounted into /docker-entrypoint-initdb.d/ and runs only
-- when the data volume is empty (fresh init).

-- todo-api
CREATE DATABASE todo_db;

-- sagepoint
CREATE DATABASE sagepoint;
\c sagepoint
CREATE EXTENSION IF NOT EXISTS vector;
