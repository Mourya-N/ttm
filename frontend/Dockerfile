# ============================================================
# Stage 1: Build the React app
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
RUN npm ci --silent

# Copy source — ARG lets Railway pass VITE_API_URL at build time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

# ============================================================
# Stage 2: Serve with Nginx
# ============================================================
FROM nginx:1.25-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Railway injects a PORT env var. Nginx must listen on it.
CMD sed -i -e 's/listen 80;/listen '"$PORT"';/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'
