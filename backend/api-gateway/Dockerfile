FROM node:20-alpine

WORKDIR /app

# Copy shared library
COPY shared ./shared

# Install shared dependencies
WORKDIR /app/shared
RUN npm install --omit=dev

# Copy gateway package.json first
WORKDIR /app/api-gateway

COPY api-gateway/package*.json ./

RUN npm install --omit=dev

# Copy complete api-gateway service
COPY api-gateway/ .

EXPOSE 8080

CMD ["npm", "start"]
