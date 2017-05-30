FROM mhart/alpine-node:0.10.38
MAINTAINER butlerx <butlerx@notthe.cloud>

RUN apk add --update git make gcc g++ python && \
    mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD . /usr/src/app/
RUN npm install && \
    npm install -g bower
WORKDIR /usr/src/app/web
RUN bower install --allow-root
WORKDIR /usr/src/app
RUN npm run lint-lib && \
    npm run gulp && \
    apk del make gcc g++ python && \
    rm -rf /tmp/* /root/.npm /root/.node-gyp
VOLUME ["/usr/src/app"]
EXPOSE 8000
CMD ["node", "service.js"]
