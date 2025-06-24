FROM node:18-alpine

# Use a dedicated directory for the app
WORKDIR /app

# Install backend dependencies first so Docker can cache the layer
COPY server/package*.json ./server/
RUN npm ci --omit=dev --prefix ./server

# Copy application source
COPY server ./server
COPY public ./public

EXPOSE 3000

CMD ["node", "server/index.js"]
