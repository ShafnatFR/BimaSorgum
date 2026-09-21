# ============================================================
# BIMA AI Frontend - Dockerfile for Dockploy
# ============================================================
# Stage 1: Build the Vite / React App (Node.js)
# Stage 2: Serve the built static files using Nginx
# ============================================================

# --- Stage 1: Frontend Builder -------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Increase npm network timeout for slow server connections (optional but helpful)
RUN npm config set fetch-timeout 600000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-retries 5

# Install dependencies first (cache-friendly layer)
COPY package.json package-lock.json* bun.lock* ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the Vite application
RUN npm run build


# --- Stage 2: Nginx Web Server -------------------------------
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the built assets from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration for React SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Nginx alpine runs natively in the foreground, no need for custom entrypoint
CMD ["nginx", "-g", "daemon off;"]
