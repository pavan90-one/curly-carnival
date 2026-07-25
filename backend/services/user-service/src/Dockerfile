FROM  node:20-alpine
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV PORT=4001
EXPOSE 4001
CMD ["node", "app.js"]
