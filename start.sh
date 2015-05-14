#! /bin/bash

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd );
FILE="$DIR/web/config/$2".env
START=$DIR"/"$1
USAGE="Usage: ./start.sh <startscript> <config>"

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

exec node $START
