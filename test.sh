#!/bin/bash
./node_modules/mocha/bin/mocha --require should -R ${1:-spec} test
