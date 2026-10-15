#!/bin/sh
# Daily MySQL backup on the VPS. Example cron (as root):  0 2 * * * /opt/montrixfortune/scripts/backup.sh
# Keeps 14 days. Copy the folder off the server too (object storage, another machine).
set -eu
DIR="${BACKUP_DIR:-/var/backups/montrix}"
mkdir -p "$DIR"
CONTAINER="$(docker ps --filter name=db --format '{{.Names}}' | head -n1)"
docker exec "$CONTAINER" sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines montrix_furniture' | gzip > "$DIR/montrix-$(date +%F).sql.gz"
find "$DIR" -name 'montrix-*.sql.gz' -mtime +14 -delete
