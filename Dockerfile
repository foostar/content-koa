FROM node:7.5

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json /usr/src/app/

RUN npm install --production --registry=https://registry.npm.taobao.org

COPY . /usr/src/app

EXPOSE 8080