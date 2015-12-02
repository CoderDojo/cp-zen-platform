#! /bin/bash

FILE=$1
USAGE="Usage: ./start.sh <config> [startscript_opts]..."

if [ ! -r $FILE ] ; then
    echo "config file not found: $1"
    echo $USAGE
    exit 1
fi

source $FILE

exec node node_modules/.bin/pm2 start web/ $@
