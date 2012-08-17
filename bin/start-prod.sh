#!/bin/bash

DIR=$(cd $(dirname "$0"); pwd) 

export NODE_ENV=production
pushd $DIR/..
forever start optymetrics.js
