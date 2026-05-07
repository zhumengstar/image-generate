#!/bin/sh
set -eu

MYSQL_DATA_DIR="${MYSQL_DATA_DIR:-/var/lib/mysql}"
MYSQL_RUN_DIR="${MYSQL_RUN_DIR:-/run/mysqld}"
MYSQL_SOCKET="${MYSQL_SOCKET:-${MYSQL_RUN_DIR}/mysqld.sock}"
MYSQL_PID_FILE="${MYSQL_PID_FILE:-${MYSQL_RUN_DIR}/mysqld.pid}"
MYSQL_DATABASE="${MYSQL_DATABASE:-gpt_image_studio}"
MYSQL_USER="${MYSQL_USER:-image2creat}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-image2creat-change-me}"

mkdir -p "$MYSQL_DATA_DIR" "$MYSQL_RUN_DIR" "${DATA_DIR:-/data/generated}"
chown -R mysql:mysql "$MYSQL_DATA_DIR" "$MYSQL_RUN_DIR"

sql_escape() {
  printf "%s" "$1" | sed "s/'/''/g"
}

sql_identifier_escape() {
  printf "%s" "$1" | sed 's/`/``/g'
}

mysql_socket() {
  mariadb --protocol=socket --socket="$MYSQL_SOCKET" -uroot "$@"
}

if [ ! -d "$MYSQL_DATA_DIR/mysql" ]; then
  echo "Initializing MariaDB data directory at ${MYSQL_DATA_DIR}"
  mariadb-install-db \
    --user=mysql \
    --datadir="$MYSQL_DATA_DIR" \
    --auth-root-authentication-method=normal \
    --skip-test-db >/dev/null
fi

echo "Starting local MariaDB"
mariadbd \
  --user=mysql \
  --datadir="$MYSQL_DATA_DIR" \
  --socket="$MYSQL_SOCKET" \
  --pid-file="$MYSQL_PID_FILE" \
  --bind-address=127.0.0.1 \
  --port="${MYSQL_PORT:-3306}" \
  --skip-networking=0 &
MYSQLD_PID="$!"

cleanup() {
  if kill -0 "$MYSQLD_PID" 2>/dev/null; then
    mysqladmin --protocol=socket --socket="$MYSQL_SOCKET" -uroot shutdown >/dev/null 2>&1 || kill "$MYSQLD_PID" 2>/dev/null || true
    wait "$MYSQLD_PID" 2>/dev/null || true
  fi
}
trap cleanup INT TERM EXIT

tries=0
until mysqladmin --protocol=socket --socket="$MYSQL_SOCKET" -uroot ping >/dev/null 2>&1; do
  tries=$((tries + 1))
  if [ "$tries" -gt 60 ]; then
    echo "MariaDB did not become ready in time" >&2
    exit 1
  fi
  sleep 1
done

DB_ESCAPED="$(sql_identifier_escape "$MYSQL_DATABASE")"
USER_ESCAPED="$(sql_escape "$MYSQL_USER")"
PASSWORD_ESCAPED="$(sql_escape "$MYSQL_PASSWORD")"

mysql_socket <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_ESCAPED}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${USER_ESCAPED}'@'127.0.0.1' IDENTIFIED BY '${PASSWORD_ESCAPED}';
CREATE USER IF NOT EXISTS '${USER_ESCAPED}'@'localhost' IDENTIFIED BY '${PASSWORD_ESCAPED}';
ALTER USER '${USER_ESCAPED}'@'127.0.0.1' IDENTIFIED BY '${PASSWORD_ESCAPED}';
ALTER USER '${USER_ESCAPED}'@'localhost' IDENTIFIED BY '${PASSWORD_ESCAPED}';
GRANT ALL PRIVILEGES ON \`${DB_ESCAPED}\`.* TO '${USER_ESCAPED}'@'127.0.0.1';
GRANT ALL PRIVILEGES ON \`${DB_ESCAPED}\`.* TO '${USER_ESCAPED}'@'localhost';
FLUSH PRIVILEGES;
SQL

export MYSQL_HOST="${MYSQL_HOST:-127.0.0.1}"
export MYSQL_PORT="${MYSQL_PORT:-3306}"
export MYSQL_DATABASE="$MYSQL_DATABASE"
export MYSQL_USER="$MYSQL_USER"
export MYSQL_PASSWORD="$MYSQL_PASSWORD"
export MYSQL_CREATE_DATABASE=false
export DATA_DIR="${DATA_DIR:-/data/generated}"

echo "Starting image2creat on port ${PORT:-3000}"
"$@" &
APP_PID="$!"
wait "$APP_PID"
