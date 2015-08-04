#! /bin/bash

FILE=$1
START=$2
USAGE="Usage: ./start.sh <config> <startscript> [startscript_opts]..."

if [ ! -r $FILE ] ; then
    echo "config file not found: $1"
    echo $USAGE
    exit 1
fi

if [ ! -r $START ] ; then
    echo "start script not found: $2"
    echo $USAGE
    exit 1
fi

source $FILE

exec node $START $@
