#!/bin/bash
isExistApp=`pgrep cp-zen-platform`
if [[ -n $isExistApp ]]; then
  service cp-zen-platform stop
fi
