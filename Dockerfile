FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --force

COPY . .

RUN npm run build

EXPOSE 3003

CMD ["npm", "run", "start"]