# ---------- STAGE 1: Build ----------
FROM node:20-alpine AS build

WORKDIR /app

# Копируем package.json из expressServer/
COPY expressServer/package.json expressServer/package-lock.json* ./
RUN npm ci

# Копируем весь исходный код expressServer/
COPY expressServer/. .

RUN npm run build


# ---------- STAGE 2: Runtime ----------
FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY expressServer/package.json expressServer/package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3535

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
	CMD wget -qO- http://localhost:3535/ || exit 1

CMD ["node", "dist/server.js"]