
# Based on: https://github.com/visionmedia/superagent/blob/master/Makefile

TESTS ?= test/*.js
REPORTER = spec

all: test

test:
	@NODE_ENV=test "./node_modules/.bin/mocha" \
		--reporter $(REPORTER) \
		--timeout 5000 \
		$(TESTS)

clean:
	rm -fr test/tmp

.PHONY: test clean
