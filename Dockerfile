FROM node:0.10
MAINTAINER nearForm <info@nearform.com>

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install && rm -rf /root/.npm
COPY . /usr/src/app

VOLUME ["/usr/src/app/public"]
