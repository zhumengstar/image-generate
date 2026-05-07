#!/bin/sh
set -eu

for _ in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30; do
  if curl -fsS --max-time 3 http://127.0.0.1:3456/api/health >/dev/null; then
    break
  fi
  sleep 1
done

cat > /tmp/image2creat-login.json <<'EOF'
{"email":"admin@example.com","password":"jJC2fldklTKT5Lhxj7BB"}
EOF

headers=/tmp/image2creat-login.headers
body=/tmp/image2creat-login.body
curl -sS --max-time 10 -D "$headers" -o "$body" \
  -X POST http://127.0.0.1:3456/api/auth/login \
  -H 'Content-Type: application/json' \
  --data-binary @/tmp/image2creat-login.json
cat "$body"
printf '\n'

COOKIE=$(awk 'BEGIN{IGNORECASE=1} /^Set-Cookie:/ {sub(/^Set-Cookie:[[:space:]]*/, ""); split($0,a,";"); print a[1]; exit}' "$headers")
echo "COOKIE=$COOKIE"

for path in /api/auth/me /api/admin/settings /api/admin/users /api/admin/generations /api/images/history /api/images/public /api/stats/today; do
  echo "===$path==="
  curl -fsS --max-time 10 -H "Cookie: $COOKIE" "http://127.0.0.1:3456$path" | head -c 500
  printf '\n'
done

echo '===errors==='
docker logs --since 3m image2creat 2>&1 | grep -E 'Error:|ReferenceError|Internal server|ER_' || true

