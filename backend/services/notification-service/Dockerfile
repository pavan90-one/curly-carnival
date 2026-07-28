FROM node:20-alpine
WORKDIR /app
COPY shared ./shared
RUN cd ./shared && npm install --omit=dev
COPY services/notification-service/package*.json ./services/notification-service/
WORKDIR /app/services/notification-service
RUN npm install --omit=dev
COPY services/notification-service/src ./src
EXPOSE 4005
CMD ["npm", "start"]
