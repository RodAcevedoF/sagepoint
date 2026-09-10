set -eu

mkdir -p /plugins
cp /var/lib/neo4j/labs/apoc-*-core.jar /plugins/
exec /startup/docker-entrypoint.sh neo4j
