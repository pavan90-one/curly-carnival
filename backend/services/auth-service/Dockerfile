FROM node:20-alpine

WORKDIR /app

# Copy shared library
COPY shared ./shared

# Install shared dependencies
WORKDIR /app/shared
RUN npm install --omit=dev

# Copy auth package.json first
WORKDIR /app/services/auth-service

COPY services/auth-service/package*.json ./

RUN npm install --omit=dev

# Copy complete auth service
COPY services/auth-service/ .

EXPOSE 4006

CMD ["npm", "start"]
