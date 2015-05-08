
USER = platform
HOST = localhost
PORT= 5432

ES_HOST=localhost
ES_PORT=9200
ES_PROTOCOL=http
ES_INDEX=cd-zen-platform-development

DB=cd-zen-platform-development

db-create:
	psql --single-transaction -h $(HOST) -U $(USER) -d $(DB) -f ./scripts/database/pg/create-schema.sql --port $(PORT)

db-populate:
	psql --single-transaction -h $(HOST) -U $(USER) -d $(DB) -f ./scripts/database/pg/populate-countries-and-geonames.sql --port $(PORT)
	psql --single-transaction -h $(HOST) -U $(USER) -d $(DB) -f ./scripts/database/pg/populate-dojos.sql --port $(PORT)

add-users:
	node scripts/insert-test-users.js

es-delete-index:
	@echo "\nDeleting '$(ES_INDEX)' index \n" ;
	curl -XDELETE '$(ES_PROTOCOL)://$(ES_HOST):$(ES_PORT)/$(ES_INDEX)?pretty'

es-index-dojos:
	cd ../cp-dojos-service/ && node scripts/es-index-dojos-data.js

es-index-countries-geo:
	cd ../cp-countries-service/ && node scripts/countries-import.js
	cd ../cp-countries-service/ && node scripts/geonames-import.js --country=no-country
	cd ../cp-countries-service/ && node scripts/geonames-import.js --country=IE
	cd ../cp-countries-service/ && node scripts/geonames-import.js --country=RO