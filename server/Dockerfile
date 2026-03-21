FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      texlive-base \
      texlive-latex-extra \
      texlive-fonts-recommended && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
# templates are mounted via docker-compose volume
RUN mkdir -p uploads output templates
EXPOSE 4000
CMD ["node", "dist/index.js"]
