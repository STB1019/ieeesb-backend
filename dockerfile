FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json .

RUN npm install -g npm@latest
RUN npm i

COPY ./ .

EXPOSE 8081

CMD [ "npm", "run", "dev" ]