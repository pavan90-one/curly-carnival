FROM node:20-alpine

WORKDIR /app

# Copy shared library
COPY shared ./shared

# Install shared dependencies
WORKDIR /app/shared
RUN npm install --omit=dev

# Copy user package.json first
WORKDIR /app/services/user-service

COPY services/user-service/package*.json ./

RUN npm install --omit=dev

# Copy complete user service
COPY services/user-service/ .

EXPOSE 4001

CMD ["npm", "start"]
