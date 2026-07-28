FROM node:20-alpine
WORKDIR /app
COPY shared ./shared
RUN cd ./shared && npm install --omit=dev
COPY services/auth-service/package*.json ./services/auth-service/
WORKDIR /app/services/auth-service
RUN npm install --omit=dev
COPY services/auth-service/src ./src
EXPOSE 4006
CMD ["npm", "start"]
