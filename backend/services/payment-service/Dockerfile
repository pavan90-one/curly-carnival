FROM node:20-alpine

WORKDIR /app

# Copy shared library
COPY shared ./shared

# Install shared dependencies
WORKDIR /app/shared
RUN npm install --omit=dev

# Copy payment package.json first
WORKDIR /app/services/payment-service

COPY services/payment-service/package*.json ./

RUN npm install --omit=dev

# Copy complete payment service
COPY services/payment-service/ .

EXPOSE 4004

CMD ["npm", "start"]
