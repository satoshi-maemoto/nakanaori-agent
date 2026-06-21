FROM node:22-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/agents/package.json packages/agents/
COPY services/api/package.json services/api/

RUN npm ci

COPY packages/agents packages/agents
COPY services/api services/api

RUN npm run build --workspace=@nakanaori/agents && npm run build --workspace=nakanaori-api

FROM node:22-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY package.json package-lock.json ./
COPY packages/agents/package.json packages/agents/
COPY services/api/package.json services/api/

RUN npm ci --omit=dev

COPY --from=builder /app/packages/agents/dist packages/agents/dist
COPY --from=builder /app/packages/agents/package.json packages/agents/
COPY --from=builder /app/services/api/dist services/api/dist

EXPOSE 8080

CMD ["node", "services/api/dist/index.js"]
