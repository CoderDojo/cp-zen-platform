FROM mhart/alpine-node:0.10
MAINTAINER nearForm <info@nearform.com>

RUN apk-install git make gcc g++ python

RUN mkdir -p /usr/src/app /usr/src/lib /usr/src/web /usr/src/tasks
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
COPY lib /usr/src/app/lib/
COPY web /usr/src/app/web/
COPY tasks /usr/src/app/tasks/
COPY *.js /usr/src/app/
RUN npm install --production 

RUN apk del make gcc g++ python && rm -rf /tmp/* /root/.npm /root/.node-gyp
  
VOLUME ["/usr/src/app/public"]
