#! /bin/bash


exec node node_modules/.bin/pm2 stop web/ $@
