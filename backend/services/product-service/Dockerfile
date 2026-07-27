FROM node:20-alpine
WORKDIR /app
COPY shared/messaging ./shared/messaging
COPY services/product-service/package*.json ./services/product-service/
WORKDIR /app/services/product-service
RUN npm install --omit=dev
COPY services/product-service/src ./src
EXPOSE 4002
CMD ["npm", "start"]
