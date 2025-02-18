# syntax = docker/dockerfile:1

# Adjust BUN_VERSION as desired
ARG BUN_VERSION=1.2.2
FROM oven/bun:${BUN_VERSION}-slim AS base

LABEL fly_launch_runtime="Bun"

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential curl ca-certificates pkg-config python-is-python3

# Install Node.js
ARG NODE_VERSION=20.9.0
ENV PATH=/usr/local/node/bin:$PATH
RUN curl -sL https://github.com/nodenv/node-build/archive/master.tar.gz | tar xz -C /tmp/ && \
    /tmp/node-build-master/bin/node-build "${NODE_VERSION}" /usr/local/node && \
    rm -rf /tmp/node-build-master

# Bun app lives here
WORKDIR /app
ENV NODE_ENV="production"


FROM base AS build
COPY bun.lock package.json ./
RUN bun install
COPY . .
RUN bun run build    
# Remove development dependencies
# RUN rm -rf node_modules && \
#     bun install --ci


FROM base
COPY --from=build /app /app
EXPOSE 8000
CMD [ "bun", "run", "start" ]
