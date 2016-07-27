var http = require('http');
var express = require('express');
var app = express();
var queryString = require('querystring');
var urlParse = require('url-parse');
var bodyParser = require('body-parser');
var pg = require('pg');

// var conString = 'pg://postgres:pass@localhost:5432/postgres'

// var client = new pg.Client(conString);
// client.connect();

var users={};

var IP_ADDRESS = process.env.OPENSHIFT_NODEJS_IP;
var PORT = process.env.OPENSHIFT_NODEJS_PORT || 4040;

var getDashboard = function (){
	var startHtml = "<html><head><title>Dashboard</title></head><body>";
	var body = "<input type='text'><input type='text'><input type='text'>"
	var endHtml = "</body></html>"

	return (startHtml + body + endHtml);
};

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
	if(url.username == 'admin' && url.password == '123')
		res.redirect('/dashboard');
	else
		res.send({status:false});
});


var server = http.createServer(app);
server.listen(PORT,IP_ADDRESS);
console.log("Server started at port : ", PORT);
