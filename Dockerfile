# ============================================================
# BIMA AI Frontend - Dockerfile for Dockploy (Vite Preview)
# ============================================================

FROM node:20-alpine

WORKDIR /app

# Increase npm network timeout for slow server connections
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

# Expose port 4173 (Vite preview default)
EXPOSE 4173

# Run vite preview
CMD ["npm", "run", "preview"]
