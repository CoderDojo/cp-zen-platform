FROM mhart/alpine-node:0.10.48
ENV NODE_ENV development
RUN apk add --update git python build-base && \
    npm install -g nodemon bower && \
    mkdir -p /usr/src/app /usr/src/cp-translations /usr/src/cp-zen-frontend
WORKDIR /usr/src/app
ADD docker-entrypoint.sh /usr/src
VOLUME /usr/src/app /usr/src/cp-translations /usr/src/cp-zen-frontend
EXPOSE 8000
CMD ["/usr/src/docker-entrypoint.sh"]
