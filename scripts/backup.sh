#!/bin/sh
set -e
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump "$DATABASE_URL_SYNC" | gzip > "/backups/backup_${TIMESTAMP}.sql.gz"
find /backups -name "backup_*.sql.gz" -mtime +7 -delete