# Builder
FROM node:16-alpine as builder

# Copy server and domain + lib packages
WORKDIR /usr/src/rueda-sabor/
COPY .eslintrc .
COPY .eslintignore .
COPY package.json .
COPY tsconfig.json .
COPY yarn.lock .
COPY scripts/fix-common-package-exports.sh scripts/fix-common-package-exports.sh

COPY packages/server packages/server
COPY packages/domain packages/domain
COPY packages/lib packages/lib

# Install domain + lib + server dependencies
RUN yarn install --pure-lockfile --non-interactive

# Build common packages
RUN yarn build:common

# Build server then
WORKDIR /usr/src/rueda-sabor/packages/server
RUN yarn build

# Runner
FROM node:16-alpine AS runner

WORKDIR /usr/src/rueda-sabor
COPY VERSION .

# Copy the dist builds from builder
COPY --from=builder /usr/src/rueda-sabor/package.json .
COPY --from=builder /usr/src/rueda-sabor/yarn.lock .
COPY --from=builder /usr/src/rueda-sabor/tsconfig.json .

COPY --from=builder /usr/src/rueda-sabor/packages/domain/package.json packages/domain/package.json
COPY --from=builder /usr/src/rueda-sabor/packages/domain/dist packages/domain/dist

COPY --from=builder /usr/src/rueda-sabor/packages/lib/package.json packages/lib/package.json
COPY --from=builder /usr/src/rueda-sabor/packages/lib/dist packages/lib/dist

COPY --from=builder /usr/src/rueda-sabor/packages/server/package.json packages/server/package.json
COPY --from=builder /usr/src/rueda-sabor/packages/server/dist packages/server/dist

# Install production dependencies
RUN yarn install --pure-lockfile --non-interactive --production

# Move to the server app
WORKDIR /usr/src/rueda-sabor/packages/server

# Set the correct ownership for the app folder
RUN chown -R node:node /usr/src/rueda-sabor/packages/server/

# Launch the server with container
ARG NODE_ENV=production
CMD ["yarn", "start:prod"]
