FROM node:13-alpine
RUN apk add --no-cache git
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD [ "npm", "start" ]