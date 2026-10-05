#!/usr/bin/env bash
# graduss bazasining kunlik zaxirasi (pg_dump → gzip), 14 kun saqlanadi.
set -euo pipefail
DIR=/var/backups/graduss
mkdir -p "$DIR"
OUT="$DIR/graduss-$(date -u +%Y%m%d-%H%M).sql.gz"
docker exec graduss-postgres pg_dump -U graduss -d graduss --no-owner | gzip -9 > "$OUT.tmp"
# bo'sh yoki buzilgan dump'ni saqlamaymiz
[ "$(gzip -dc "$OUT.tmp" | head -c 200 | wc -c)" -gt 100 ] || { rm -f "$OUT.tmp"; echo "dump bo'sh" >&2; exit 1; }
mv "$OUT.tmp" "$OUT"
chmod 600 "$OUT"
find "$DIR" -name 'graduss-*.sql.gz' -mtime +14 -delete
echo "zaxira: $OUT"
