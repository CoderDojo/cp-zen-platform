#! /usr/bin/env sh
# Dont chain this command to following commands as the post install is going to fail
npm install
rm -rf node_modules/cp-translations
rm -rf node_modules/cp-zen-frontend
ln -s /usr/src/cp-translations node_modules/cp-translations
ln -s /usr/src/cp-zen-frontend node_modules/cp-zen-frontend
./node_modules/.bin/bower install --allow-root
npm run dev
