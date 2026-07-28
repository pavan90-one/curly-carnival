FROM node:20-alpine
WORKDIR /app
COPY shared ./shared
RUN cd ./shared && npm install --omit=dev
COPY services/payment-service/package*.json ./services/payment-service/
WORKDIR /app/services/payment-service
RUN npm install --omit=dev
COPY services/payment-service/src ./src
EXPOSE 4004
CMD ["npm", "start"]
