var http = require('http');
var express = require('express');
var app = express();
var queryString = require('querystring');
var urlParse = require('url-parse');
var bodyParser = require('body-parser');
var pg = require('pg');

var config = {
  user: process.env.OPENSHIFT_POSTGRESQL_DB_USERNAME || process.env.FINANZA_POSTGRESQL_DB_USERNAME, 
  database: 'finanza',
  password: process.env.OPENSHIFT_POSTGRESQL_DB_PASSWORD || process.env.FINANZA_POSTGRESQL_DB_PASSWORD,
  port: process.env.OPENSHIFT_POSTGRESQL_DB_HOST || 5432,
  max: 10,
  idleTimeoutMillis: 30000
};

var pool = new pg.Pool(config);
pool.connect();
var users = {};


var populateUsers = function(){
  pool.connect(function(err, client, done) {
        if(err) {
          return console.error('error fetching client from pool', err);
        }
          client.query('SELECT * FROM user_details', function(err, result) {
              if(!err)
                users = result.rows;
              else
                return console.error('error running query', err);
          });
    });
}
populateUsers();

var verifyUser = function (username, password) {
    if(users[0].name == username && users[0].password == password)
      return true;
    return false;
};

var IP_ADDRESS = process.env.OPENSHIFT_NODEJS_IP;
var PORT = process.env.OPENSHIFT_NODEJS_PORT || 4040;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./public'));

app.get('/', function(req, res){
	res.render('index');
});

app.get('/dashboard', function(req, res){
	var options = {
    root: __dirname + '/public/',
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };

  var fileName = 'dashboard.html';
  res.sendFile(fileName, options, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', fileName);
    }
  });
});

app.post('/login', function(req, res){
	var url = req.body;
	if(verifyUser(url.username, url.password))
		res.redirect('/dashboard');
	else
		res.send({status:false});
});

var server = http.createServer(app);
server.listen(PORT,IP_ADDRESS);
console.log("Server started at port : ", PORT);
