#!/usr/bin/env bash
# Frontend tutun sinovi: build -> preview (4199) -> tests/smoke.mjs. Natija chiqish kodida (0 = hammasi o'tdi).
# Eslatma: `pkill -f` ISHLATILMAYDI (o'z shell'ni ham o'ldiradi); preview PID bilan to'xtatiladi.
set -uo pipefail
cd "$(dirname "$0")/.."
PORT=4199
# Oldingi (qolib ketgan) preview bo'lsa to'xtatamiz.
kill $(ss -ltnp 2>/dev/null | grep ":$PORT " | grep -o 'pid=[0-9]*' | cut -d= -f2) 2>/dev/null
if [ "${SKIP_BUILD:-0}" != "1" ]; then
  echo "== build (demo rejim) =="
  nice npx vite build >/tmp/graduss-smoke-build.log 2>&1 || { tail -20 /tmp/graduss-smoke-build.log; echo "BUILD YIQILDI"; exit 2; }
fi
echo "== preview :$PORT =="
nice npx vite preview --host 127.0.0.1 --port $PORT >/tmp/graduss-smoke-preview.log 2>&1 &
PID=$!
# nice->npx->node zanjiri: ota jarayon emas, PORTni tinglayotgan jarayon to'xtatiladi.
stop_preview() {
  kill $PID 2>/dev/null
  kill $(ss -ltnp 2>/dev/null | grep ":$PORT " | grep -o 'pid=[0-9]*' | cut -d= -f2) 2>/dev/null
}
trap stop_preview EXIT
for i in $(seq 1 40); do
  curl -sf -o /dev/null "http://127.0.0.1:$PORT/" && break
  sleep 0.5
done
curl -sf -o /dev/null "http://127.0.0.1:$PORT/" || { echo "preview ishga tushmadi"; tail -5 /tmp/graduss-smoke-preview.log; exit 2; }
echo "== smoke =="
node tests/smoke.mjs "http://127.0.0.1:$PORT"
