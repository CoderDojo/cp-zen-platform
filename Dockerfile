FROM mhart/alpine-node:0.10.48
MAINTAINER butlerx <butlerx@notthe.cloud>
ARG DEP_VERSION=latest
RUN if [ "$SOURCE_BRANCH" = "staging" ]; then DEP_VERSION=staging fi && \
    apk add --update git make gcc g++ python && \
    mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD . /usr/src/app/
ENV DEP_VERSION=latest
RUN npm install && \
    npm install cp-zen-frontend@$DEP_VERSION cp-translations@$DEP_VERSION && \
    node_modules/.bin/bower install --allow-root && \
    npm build && \
    apk del make gcc g++ python && \
    rm -rf /tmp/* /root/.npm /root/.node-gyp
EXPOSE 8000
CMD ["node", "service.js"]
