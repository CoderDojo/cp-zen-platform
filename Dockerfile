FROM node:8-alpine
MAINTAINER butlerx <butlerx@notthe.cloud>
ARG DEP_VERSION=latest
RUN apk add --update git make gcc g++ python && \
    mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app/
RUN yarn && \
    yarn add cp-zen-frontend@"$DEP_VERSION" cp-translations@"$DEP_VERSION" && \
    node_modules/.bin/bower install --allow-root && \
    yarn build && \
    apk del make gcc g++ python && \
    rm -rf /tmp/* /root/.npm /root/.node-gyp
EXPOSE 8000
CMD ["yarn", "start"]
