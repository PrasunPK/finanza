rm /tmp/database.json


DB_ROOT_CONFIG_FILE="./app-root/repo/database.json"
DATABASE_CONFIG_FILE="/tmp/database.json"

cp "${DB_ROOT_CONFIG_FILE}"  "${DATABASE_CONFIG_FILE}"

if [ -f "$DB_ROOT_CONFIG_FILE" ]; then
	PRODUCTION_MIGRATION_DIR="./app-root/repo/migrations"
else
	PRODUCTION_MIGRATION_DIR="./migrations"
fi


db-migrate up "--config ${DATABASE_CONFIG_FILE} --migrations-dir ${PRODUCTION_MIGRATION_DIR}  -e ${NODE_ENVIRONMENT}"