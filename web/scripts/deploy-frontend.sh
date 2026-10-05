#!/usr/bin/env bash
# Frontendni graduss.uz ga chiqarish: BUILD -> SMOKE (majburiy to'siq) -> atomik almashtirish -> tekshiruv.
# Smoke yiqilsa deploy QILINMAYDI. Backendga tegmaydi (install.sh backendni ham qayta ishga tushiradi, shuning uchun u ishlatilmaydi).
set -euo pipefail
cd "$(dirname "$0")/.."
bash scripts/smoke.sh || { echo "SMOKE YIQILDI: deploy bekor qilindi"; exit 1; }
SITE=/var/www/graduss
sudo rm -rf "$SITE.new"
sudo cp -r build "$SITE.new"
sudo chmod -R a+rX "$SITE.new"
[ -d "$SITE" ] && sudo mv "$SITE" "$SITE.old"
sudo mv "$SITE.new" "$SITE"
sudo rm -rf "$SITE.old"
code=$(curl -s -o /dev/null -w "%{http_code}" https://graduss.uz/)
echo "deploy tugadi: https://graduss.uz/ -> HTTP $code"
[ "$code" = "200" ]
