#!/bin/bash

DIR=$(cd $(dirname "$0"); pwd) 

export NODE_ENV=production
forever start $DIR/../optymetrics.js
