FROM node:20-alpine
WORKDIR /app
COPY shared ./shared
RUN cd ./shared && npm install --omit=dev
COPY services/order-service/package*.json ./services/order-service/
WORKDIR /app/services/order-service
RUN npm install --omit=dev
COPY services/order-service/src ./src
EXPOSE 4003
CMD ["npm", "start"]
