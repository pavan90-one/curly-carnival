FROM node:20-alpine
WORKDIR /app
COPY shared/messaging ./shared/messaging
COPY services/user-service/package*.json ./services/user-service/
WORKDIR /app/services/user-service
RUN npm install --omit=dev
COPY services/user-service/src ./src
EXPOSE 4001
CMD ["npm", "start"]
