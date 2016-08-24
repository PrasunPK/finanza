var http = require('http');
var Client = require('pg-native');

var migration = require('./src/migration');
var requestHandler = require('./src/router.js');

var IP_ADDRESS = process.env.OPENSHIFT_NODEJS_IP;
var PORT = process.env.OPENSHIFT_NODEJS_PORT || 4040;

var conString;
if (process.env.OPENSHIFT_POSTGRESQL_DB_USERNAME && process.env.OPENSHIFT_POSTGRESQL_DB_PASSWORD) {
    conString = 'pg://' + process.env.OPENSHIFT_POSTGRESQL_DB_USERNAME + ':' + process.env.OPENSHIFT_POSTGRESQL_DB_PASSWORD + '@' + process.env.OPENSHIFT_POSTGRESQL_DB_HOST + ':' + process.env.OPENSHIFT_POSTGRESQL_DB_PORT + '/finanza';
} else {
    conString = 'postgres://' + process.env.FINANZA_POSTGRESQL_DB_USERNAME + ':' + process.env.FINANZA_POSTGRESQL_DB_PASSWORD + '@localhost:5432/finanza';
}
var client = new Client();
client.connectSync(conString);

migration();

var handler = requestHandler(client);
var server = http.createServer(handler);
server.listen(PORT, IP_ADDRESS, function () {
    console.log("Server started at port : ", PORT);
});
