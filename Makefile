.PHONY: test logs

BRANCH := $(shell git rev-parse --abbrev-ref HEAD)
TAG ?= $(shell werf slugify -f docker-tag $(BRANCH))

copycerts:
	rm -rf ./src/fabcerts/orderers/* ./src/fabcerts/peers/org1/peer0/* ./src/fabcerts/ca/* ./src/fabcerts/peers/org1/peer1/* ./src/fabcerts/orderers/*
	cp ../karma-ledger/network/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt ./src/fabcerts/peers/org1/peer0/ca.crt
	cp ../karma-ledger/network/crypto/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/ca.crt ./src/fabcerts/peers/org1/peer1/ca.crt
	cp ../karma-ledger/network/crypto/peerOrganizations/org1.example.com/ca/ca.org1.example.com-cert.pem ./src/fabcerts/ca/ca.pem
	cp ../karma-ledger/network/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt ./src/fabcerts/orderers/ca.crt

install:
	docker-compose run --rm explorer npm ci

reinstall:
	docker-compose run --rm explorer sh -c "rm -rf node_modules && npm ci"

start:
	docker-compose up -d

shell:
	docker-compose exec explorer sh

test-shell:
	docker-compose exec -e NODE_ENV=test explorer sh

db-shell:
	docker-compose exec explorer_db psql -U hlf-explorer -d hlf-explorer

repl: 
	docker-compose exec explorer sh -c "npm run repl"

db-reset:
	docker-compose run --rm explorer sh -c "npm run schema:drop && npm run migration:run"

logs:
	docker-compose logs -f explorer

migrate:
	docker-compose run --rm explorer npm run migration:run

build:
	werf build --stages-storage :local --introspect-error

werf-render:
	werf helm render --set "global.env=develop"

