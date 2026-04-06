# ---- Build Stage ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# ---- Production Stage ----
FROM node:20-alpine
WORKDIR /app
COPY server.js ./
COPY --from=builder /app/frontend/dist ./frontend/dist
EXPOSE 8080
CMD ["node", "server.js"]