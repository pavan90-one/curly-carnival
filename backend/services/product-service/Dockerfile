FROM node:20-alpine

WORKDIR /app

# Copy shared library
COPY shared ./shared

# Install shared dependencies
WORKDIR /app/shared
RUN npm install --omit=dev

# Copy product package.json first
WORKDIR /app/services/product-service

COPY services/product-service/package*.json ./

RUN npm install --omit=dev

# Copy complete product service
COPY services/product-service/ .

EXPOSE 4002

CMD ["npm", "start"]
