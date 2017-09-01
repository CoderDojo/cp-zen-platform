#! /usr/bin/env sh
set -e
cd /usr/src/app || exit
touch .yarn.sha1
OLD_SHA=$(cat .yarn.sha1)
NEW_SHA=$(sha1sum yarn.loack)
if [ "$OLD_SHA" != "$NEW_SHA" ]; then
  echo "$NEW_SHA" > .yarn.sha1
  yarn
  rm -rf node_modules/cp-translations
  rm -rf node_modules/cp-zen-frontend
  ln -s /usr/src/cp-translations node_modules/cp-translations
  ln -s /usr/src/cp-zen-frontend node_modules/cp-zen-frontend
fi
yarn dev
