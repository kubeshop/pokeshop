#!/bin/sh

source .env

TOKEN=$TRACETEST_API_TOKEN

go install go.k6.io/xk6/cmd/xk6@latest
xk6 build --with github.com/kubeshop/xk6-tracetest@latest
./k6 run test/k6/add-pokemon.js --env XK6_TRACETEST_API_TOKEN=$TOKEN -o xk6-tracetest
