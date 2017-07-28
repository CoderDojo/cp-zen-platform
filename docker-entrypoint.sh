#! /usr/bin/env sh
cd /usr/src/cp-translations || exit
npm link
cd /usr/src/cp-zen-frontend || exit
npm link
cd /usr/src/app || exit
# Dont chain this command to following commands as the post install is going to fail
npm install
npm link cp-translations && \
npm link cp-zen-frontend && \
./node_modules/.bin/bower install --allow-root
npm run dev
