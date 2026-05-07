FROM node:22-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/data/generated
ENV MYSQL_DATA_DIR=/var/lib/mysql
ENV MYSQL_HOST=127.0.0.1
ENV MYSQL_PORT=3306
ENV MYSQL_USER=image2creat
ENV MYSQL_PASSWORD=image2creat-change-me
ENV MYSQL_DATABASE=gpt_image_studio
ENV MYSQL_CONNECTION_LIMIT=10
ENV MYSQL_CREATE_DATABASE=false

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates mariadb-server \
  && rm -rf /var/lib/apt/lists/* \
  && rm -rf /var/lib/mysql/* \
  && mkdir -p /app /data/generated /run/mysqld \
  && chown -R mysql:mysql /var/lib/mysql /run/mysqld

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
COPY docker/entrypoint.sh /usr/local/bin/image2creat-entrypoint
RUN chmod +x /usr/local/bin/image2creat-entrypoint

EXPOSE 3000
VOLUME ["/var/lib/mysql", "/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["image2creat-entrypoint"]
CMD ["node", "server.js"]
