#!/bin/sh
set -eu

BASE_URL="http://127.0.0.1:3456"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="jJC2fldklTKT5Lhxj7BB"

cat > /tmp/image2creat-login.json <<EOF
{"email":"$ADMIN_EMAIL","password":"$ADMIN_PASSWORD"}
EOF

headers=/tmp/image2creat-login.headers
body=/tmp/image2creat-login.body
curl -sS --max-time 10 -D "$headers" -o "$body" \
  -X POST "$BASE_URL/api/auth/login" \
  -H 'Content-Type: application/json' \
  --data-binary @/tmp/image2creat-login.json

echo "=== login ==="
cat "$body"
printf '\n'

COOKIE=$(awk 'BEGIN{IGNORECASE=1} /^Set-Cookie:/ {sub(/^Set-Cookie:[[:space:]]*/, ""); split($0,a,";"); print a[1]; exit}' "$headers")
if [ -z "$COOKIE" ]; then
  echo "login did not return a cookie" >&2
  exit 1
fi

echo "=== settings ==="
curl -fsS --max-time 10 -H "Cookie: $COOKIE" "$BASE_URL/api/admin/settings"
printf '\n'

cat > /tmp/image2creat-generate.json <<'EOF'
{"prompt":"A tiny blue cube on a white table, simple product photo","n":1,"size":"1024x1024","quality":"low","background":"opaque","outputFormat":"png","isPublic":false}
EOF

echo "=== generate ==="
curl -sS -i --max-time 180 \
  -X POST "$BASE_URL/api/images/generate" \
  -H 'Content-Type: application/json' \
  -H "Cookie: $COOKIE" \
  --data-binary @/tmp/image2creat-generate.json
printf '\n'

echo "=== recent generations ==="
curl -fsS --max-time 10 -H "Cookie: $COOKIE" "$BASE_URL/api/admin/generations?limit=5"
printf '\n'

echo "=== recent logs ==="
docker logs --since 5m image2creat 2>&1 | tail -120

