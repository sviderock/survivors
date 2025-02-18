# syntax = docker/dockerfile:1

FROM flyio/flyctl:latest as flyio
FROM debian:bullseye-slim

RUN apt-get update; apt-get install -y ca-certificates jq

COPY <<"EOF" /srv/deploy.sh
#!/bin/bash
deploy=(flyctl deploy -a survivors)
touch /srv/.secrets

while read -r secret; do
  echo "export ${secret}=${!secret}" >> /srv/.secrets
  deploy+=(--build-secret "${secret}=${!secret}")
done < <(flyctl secrets list --json | jq -r ".[].Name")

deploy+=(--build-secret "ALL_SECRETS=$(base64 --wrap=0 /srv/.secrets)")
${deploy[@]}
EOF

RUN chmod +x /srv/deploy.sh

COPY --from=flyio /flyctl /usr/bin

WORKDIR /build
COPY . .