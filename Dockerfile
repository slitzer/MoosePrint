FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm install && cd ..
COPY server ./server
COPY public ./public
EXPOSE 3000
CMD ["node", "server/index.js"]
