#! /usr/bin/env sh
# Dont `set -e` as the post install is going to fail
cd /usr/src/app || exit
touch .pkg.sha1
OLD_SHA=$(cat .pkg.sha1)
NEW_SHA=$(sha1sum package.json)
if [ "$OLD_SHA" != "$NEW_SHA" ]; then
  echo "$NEW_SHA" > .pkg.sha1
  npm install
  rm -rf node_modules/cp-translations
  rm -rf node_modules/cp-zen-frontend
  ln -s /usr/src/cp-translations node_modules/cp-translations
  ln -s /usr/src/cp-zen-frontend node_modules/cp-zen-frontend
  ./node_modules/.bin/bower install --allow-root
fi
npm run dev
