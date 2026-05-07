#!/bin/sh
set -eu

cd /opt/image2creat

sed -i '88c\    header' server.js
sed -i '680c\       FROM generation_requests gr' src/mysql-store.js

echo source-server
nl -ba server.js | sed -n '86,90p'
echo source-store
nl -ba src/mysql-store.js | sed -n '676,684p'

if docker ps --format '{{.Names}}' | grep -qx image2creat; then
  docker exec image2creat sh -c "sed -i '88c\    header' /app/server.js; sed -i '680c\       FROM generation_requests gr' /app/src/mysql-store.js" || true
fi

docker compose build --no-cache image2creat >/tmp/image2creat-build.log
docker compose up -d --force-recreate image2creat
sleep 5

echo container-server
docker exec image2creat sh -c "nl -ba /app/server.js | sed -n '86,90p'"
echo container-store
docker exec image2creat sh -c "nl -ba /app/src/mysql-store.js | sed -n '676,684p'"
