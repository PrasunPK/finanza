DB_ROOT_CONFIG_FILE="./app-root/repo/database.json"
DATABASE_CONFIG_FILE="/tmp/database.json"


if [ -f "${DB_ROOT_CONFIG_FILE}" ]; then
	echo "Copying to PRODUCTION tmp directory"
	cp "${DB_ROOT_CONFIG_FILE}" "/tmp/."
else
	echo "Copying to LOCAL tmp directory"
	cp "./database.json" "/tmp/."
fi

echo "MIGRATING DATABASE ... ${MIGRATION_DIR}"
db-migrate up --config $DATABASE_CONFIG_FILE --migrations-dir $MIGRATION_DIR -e $NODE_ENVIRONMENT