FROM node:20-slim AS builder
WORKDIR /app

# Copy core package first (dependency)
COPY packages/core/package.json packages/core/package-lock.json* ./packages/core/
WORKDIR /app/packages/core
RUN npm ci
COPY packages/core/ .
RUN npm run build

# Build server
WORKDIR /app/server
COPY server/package.json server/package-lock.json* ./
RUN npm install
COPY server/ .
RUN npm run build

FROM node:20-slim
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      texlive-base \
      texlive-latex-extra \
      texlive-fonts-recommended && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copy core built output + templates
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/core/package.json ./packages/core/
COPY --from=builder /app/packages/core/templates ./packages/core/templates

# Copy server
COPY --from=builder /app/server/package.json ./
COPY --from=builder /app/server/node_modules ./node_modules
COPY --from=builder /app/server/dist ./dist

RUN mkdir -p uploads output
EXPOSE 4000
CMD ["node", "dist/index.js"]
