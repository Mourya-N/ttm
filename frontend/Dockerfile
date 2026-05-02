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

# Copy custom nginx config as a template
# Nginx's official image will automatically replace ${PORT} and move it to /etc/nginx/conf.d/
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# We don't need a special CMD anymore, the default entrypoint handles templates
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
