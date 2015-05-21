#! /bin/bash

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd );
FILE="$DIR/web/config/$1".env && shift
START="$DIR/$1" && shift
USAGE="Usage: ./start.sh <config> <startscript> [startscript_opts]..."

if [ ! -r $FILE ] ; then
  echo "config file not found"
  echo $USAGE
  exit 1
fi

if [ ! -r $START ] ; then
  echo "start script not found"
  echo $USAGE
  exit 1
fi

source $FILE

exec node $START $@
