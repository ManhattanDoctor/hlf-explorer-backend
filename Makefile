.PHONY: test logs

BRANCH := $(shell git rev-parse --abbrev-ref HEAD)
TAG ?= $(shell werf slugify -f docker-tag $(BRANCH))

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


