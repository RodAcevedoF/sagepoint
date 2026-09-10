set -eu

umask 077
app_hash=$(printf '%s' "$SAGEPOINT_REDIS_PASSWORD" | sha256sum | cut -d ' ' -f 1)
recovery_hash=$(printf '%s' "$SAGEPOINT_REDIS_RECOVERY_PASSWORD" | sha256sum | cut -d ' ' -f 1)
printf '%s\n' \
  'user default reset off' \
  "user sagepoint on #$app_hash ~* &* +@all -@admin -@dangerous +info +keys +script|load +script|exists +client|setname +client|setinfo" \
  "user recovery on #$recovery_hash ~* &* +@all" \
  'user health on nopass -@all +ping' > /tmp/sagepoint-users.acl
chown redis:redis /tmp/sagepoint-users.acl
unset SAGEPOINT_REDIS_PASSWORD SAGEPOINT_REDIS_RECOVERY_PASSWORD app_hash recovery_hash
exec /usr/local/bin/docker-entrypoint.sh redis-server --appendonly yes --appendfsync everysec --maxmemory-policy noeviction --aclfile /tmp/sagepoint-users.acl
