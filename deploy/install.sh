#!/usr/bin/env bash
# graduss.uz ni serverga o'rnatish/yangilash (idempotent). Oldindan: api release build + web build (VITE_API=1).
#   (cd api && cargo build --release -j 2) ; (cd web && VITE_API=1 npx vite build)
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(dirname "$HERE")"
DOMAIN=graduss.uz

[ -x "$REPO/api/target/release/graduss-api" ] || { echo "release binary yo'q" >&2; exit 1; }
[ -f "$REPO/web/build/index.html" ] || { echo "web build yo'q" >&2; exit 1; }

# 1) xizmat foydalanuvchisi va fayllar
id graduss >/dev/null 2>&1 || sudo useradd --system --no-create-home --shell /usr/sbin/nologin graduss
sudo install -d -o root -g graduss -m 750 /opt/graduss
sudo install -m 755 "$REPO/api/target/release/graduss-api" /opt/graduss/graduss-api.new
sudo mv /opt/graduss/graduss-api.new /opt/graduss/graduss-api
sudo install -m 640 -o root -g graduss "$HERE/graduss.env" /opt/graduss/graduss.env
sudo install -m 644 "$HERE/graduss-api.service" /etc/systemd/system/graduss-api.service
sudo systemctl daemon-reload
sudo systemctl enable graduss-api >/dev/null
sudo systemctl restart graduss-api

# 2) frontend (atomik almashtirish)
sudo rm -rf /var/www/graduss.new
sudo cp -r "$REPO/web/build" /var/www/graduss.new
sudo chmod -R a+rX /var/www/graduss.new
[ -d /var/www/graduss ] && sudo mv /var/www/graduss /var/www/graduss.old
sudo mv /var/www/graduss.new /var/www/graduss
sudo rm -rf /var/www/graduss.old

# 3) nginx: Let's Encrypt sertifikati bo'lsa shuni, bo'lmasa vaqtincha self-signed
if sudo test -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem"; then
  CERT="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"; KEY="/etc/letsencrypt/live/$DOMAIN/privkey.pem"
  HSTS='add_header Strict-Transport-Security "max-age=31536000" always;'
else
  HSTS='# HSTS faqat haqiqiy sertifikatda yoqiladi'
  CERT=/etc/nginx/graduss-selfsigned/cert.pem; KEY=/etc/nginx/graduss-selfsigned/key.pem
  if [ ! -f "$CERT" ]; then
    sudo install -d -m 700 /etc/nginx/graduss-selfsigned
    sudo openssl req -x509 -newkey rsa:2048 -nodes -days 90 -subj "/CN=$DOMAIN" \
      -addext "subjectAltName=DNS:$DOMAIN,DNS:www.$DOMAIN" -keyout "$KEY" -out "$CERT" 2>/dev/null
  fi
fi
sudo install -d /var/www/certbot
sudo install -m 644 "$HERE/graduss-proxy.conf" /etc/nginx/snippets/graduss-proxy.conf
sed -e "s|HSTS_LINE|$HSTS|" "$HERE/graduss-headers.conf" | sudo tee /etc/nginx/snippets/graduss-headers.conf >/dev/null
sed -e "s|SSL_CERT|$CERT|g" -e "s|SSL_KEY|$KEY|g" "$HERE/graduss.uz.conf" | sudo tee /etc/nginx/sites-available/$DOMAIN >/dev/null
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
sudo nginx -t
sudo systemctl reload nginx

# 4) kunlik zaxira (03:40 UTC)
sudo install -m 755 "$HERE/backup-db.sh" /usr/local/bin/graduss-backup-db
echo '40 3 * * * root /usr/local/bin/graduss-backup-db >> /var/log/graduss-backup.log 2>&1' | sudo tee /etc/cron.d/graduss-backup >/dev/null
sudo chmod 644 /etc/cron.d/graduss-backup

echo "tayyor: $DOMAIN (TLS: $CERT)"
