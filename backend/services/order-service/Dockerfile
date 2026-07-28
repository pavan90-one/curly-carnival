FROM node:20-alpine

WORKDIR /app

# Copy shared library
COPY shared ./shared

# Install shared dependencies
WORKDIR /app/shared
RUN npm install --omit=dev

# Copy order package.json first
WORKDIR /app/services/order-service

COPY services/order-service/package*.json ./

RUN npm install --omit=dev

# Copy complete order service
COPY services/order-service/ .

EXPOSE 4003

CMD ["npm", "start"]
