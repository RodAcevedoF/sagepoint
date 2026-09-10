\getenv app_password SAGEPOINT_POSTGRES_PASSWORD
CREATE ROLE sagepoint LOGIN PASSWORD :'app_password';
ALTER DATABASE sagepoint OWNER TO sagepoint;
\connect sagepoint
CREATE EXTENSION IF NOT EXISTS vector;
