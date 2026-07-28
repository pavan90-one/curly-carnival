FROM node:20-alpine
WORKDIR /app
COPY shared ./shared
RUN cd ./shared && npm install --omit=dev
COPY api-gateway/package*.json ./api-gateway/
WORKDIR /app/api-gateway
RUN npm install --omit=dev
COPY api-gateway/src ./src
EXPOSE 8080
CMD ["npm", "start"]
