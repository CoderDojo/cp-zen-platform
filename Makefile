
USER = postgres
HOST = localhost
PORT= 5432

DB=cd-zen-platform-development

db-create:
	psql --single-transaction -h $(HOST) --user $(USER) -d $(DB) -f ./scripts/database/pg/create-schema.sql --port $(PORT)
