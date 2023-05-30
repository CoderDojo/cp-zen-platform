FROM node:8-buster-slim AS base
MAINTAINER butlerx <butlerx@notthe.cloud>
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_OPTIONS=--use-openssl-ca
RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends build-essential git python3
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN git config --global url."https://github.com/".insteadOf git://github.com/ && \
    sed -i 's/mozilla\/DST_Root_CA_X3.crt/!mozilla\/DST_Root_CA_X3.crt/g' /etc/ca-certificates.conf && \
    update-ca-certificates
COPY . /usr/src/app/
RUN yarn && \
    node_modules/.bin/bower install --allow-root && \
    yarn build && \
    apt-get clean && apt-get remove -y --purge build-essential git python3 && apt-get -y autoclean && \
    rm -rf /tmp/* /root/.npm /root/.node-gyp /var/cache/apt/lists/*
EXPOSE 8000
CMD ["yarn", "start"]
