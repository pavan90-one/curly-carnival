FROM node:20-alpine

WORKDIR /app

# Copy shared library
COPY shared ./shared

# Install shared dependencies
WORKDIR /app/shared
RUN npm install --omit=dev

# Copy notification package.json first
WORKDIR /app/services/notification-service

COPY services/notification-service/package*.json ./

RUN npm install --omit=dev

# Copy complete notification service
COPY services/notification-service/ .

EXPOSE 4005

CMD ["npm", "start"]
