
USER = postgres
HOST = localhost
PORT= 5432

DB=cd-zen-platform-development

db-create:
	psql --single-transaction -h $(HOST) -U $(USER) -d $(DB) -f ./scripts/database/pg/create-schema.sql --port $(PORT)

db-populate:
	psql --single-transaction -h $(HOST) -U $(USER) -d $(DB) -f ./scripts/database/pg/populate-countries-and-geonames.sql --port $(PORT)
	psql --single-transaction -h $(HOST) -U $(USER) -d $(DB) -f ./scripts/database/pg/populate-dojos.sql --port $(PORT)

add-users:
    node scripts/insert-test-users.js

