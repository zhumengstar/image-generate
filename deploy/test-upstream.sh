#!/bin/sh
set -eu

KEY=$(docker exec image2creat sh -c 'mariadb --protocol=socket --socket=/run/mysqld/mysqld.sock -uroot -N -B -e "SELECT openai_api_key FROM gpt_image_studio.app_settings WHERE id=1"')
BASE=$(docker exec image2creat sh -c 'mariadb --protocol=socket --socket=/run/mysqld/mysqld.sock -uroot -N -B -e "SELECT api_base_url FROM gpt_image_studio.app_settings WHERE id=1"')
MODEL=$(docker exec image2creat sh -c 'mariadb --protocol=socket --socket=/run/mysqld/mysqld.sock -uroot -N -B -e "SELECT model FROM gpt_image_studio.app_settings WHERE id=1"')

echo "BASE=$BASE"
echo "MODEL=$MODEL"
echo "KEY_PREFIX=$(printf %s "$KEY" | cut -c1-7)...KEY_LEN=$(printf %s "$KEY" | wc -c)"

echo '=== /v1/models ==='
curl -sS -i --max-time 30 "$BASE/v1/models" \
  -H "Authorization: Bearer $KEY" \
  | sed -n '1,50p'

echo '=== /v1/images/generations ==='
cat > /tmp/upstream-image.json <<EOF
{"model":"$MODEL","prompt":"A tiny blue cube on a white table","n":1,"size":"1024x1024","quality":"low","background":"opaque","output_format":"png"}
EOF
curl -sS -i --max-time 120 "$BASE/v1/images/generations" \
  -H "Authorization: Bearer $KEY" \
  -H 'Content-Type: application/json' \
  --data-binary @/tmp/upstream-image.json \
  | sed -n '1,90p'

