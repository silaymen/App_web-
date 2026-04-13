# syntax=docker/dockerfile:1
# Build Angular app (Angular 17 application builder → dist/frontend/browser)
# BuildKit caches npm packages between builds (Docker Desktop enables BuildKit by default).
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --fund=false --loglevel=info

COPY . .
RUN npm run build

FROM nginx:1.25-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80
