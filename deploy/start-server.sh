#!/bin/bash
isExistApp=`ps -eaf |grep cp-zen-platform |grep -v grep| awk '{ print $2; }'`
if [[ -n $isExistApp ]]; then
    service cp-zen-platform stop
fi

service cp-zen-platform start
