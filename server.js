var http = require('http');
var express = require('express');
var app = express();
var queryString = require('querystring');
var cookieParser = require('cookie-parser');
var urlParse = require('url-parse');
var bodyParser = require('body-parser');
var pg = require('pg');
var morgan = require('morgan')

var session = require('express-session');

var pool;
if(process.env.OPENSHIFT_POSTGRESQL_DB_USERNAME && process.env.OPENSHIFT_POSTGRESQL_DB_PASSWORD){
  var conString = 'pg://' + process.env.OPENSHIFT_POSTGRESQL_DB_USERNAME + ':' + process.env.OPENSHIFT_POSTGRESQL_DB_PASSWORD + '@' + process.env.OPENSHIFT_POSTGRESQL_DB_HOST + ':' + process.env.OPENSHIFT_POSTGRESQL_DB_PORT + '/finanza';
  pool = new pg.Client(conString);
  pool.connect();
}else{
  var config = {
    user: process.env.FINANZA_POSTGRESQL_DB_USERNAME, 
    database: 'finanza',
    password: process.env.FINANZA_POSTGRESQL_DB_PASSWORD,
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000
  };
  pool = new pg.Pool(config);
  pool.connect();
}

var users = {};

var populateUsers = function(){
    pool.query('SELECT * FROM user_details', function(err, result) {
        if(!err)
          users = result.rows;
        else
          return console.error('error running query', err);
    });
}
populateUsers();

var verifyUser = function (username, password) {
  var authorized = false;
    users.forEach(function(user){
      if(user.name == username && user.password == password){
        authorized = true;
      }
    });
    return authorized;
};

var IP_ADDRESS = process.env.OPENSHIFT_NODEJS_IP;
var PORT = process.env.OPENSHIFT_NODEJS_PORT || 4040;

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./public'));
app.use(session({
    secret: 'random',
    name: 'hola',
    proxy: true,
    resave: true,
    saveUninitialized: true
}));
app.use(morgan('combined'));

var sess = {role:undefined, user:undefined};

app.get('/', function(req, res){
  sess = req.session;
	res.render('index');
});

app.get('/dashboard', function(req, res){
      if (sess && sess.user){
        	var options = {
            root: __dirname + '/public/',
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true,
                'x-user': sess.user,
                'x-role': sess.role
            }
          };

          var fileName = 'dashboard.html';
          res.sendFile(fileName, options, function (err) {
            if (err) {
              console.log(err);
              res.status(err.status).end();
            }
          });
      }else{
        res.redirect('/');
      }
});

app.post('/login', function(req, res){
	var url = req.body;
	if(verifyUser(url.username, url.password)){
    users.forEach(function(user){
      if(user.name == url.username)
        sess.role = user.role;
    });
    sess.user = url.username;
    res.redirect('/dashboard');
  }
	else{
		res.redirect('/');
  }
});

app.get('/logout',function(req, res){
    sess.user = null;
    req.session.destroy(function(err) {
      if(err) {
        console.log(err);
      } else {
        res.redirect('/');
      }
    });
})

app.get('/balances',function(req, res){
  var query = pool.query('SELECT * FROM expense_income_turnover order by updated_at DESC limit 1', function(err, result){ 
    if(!err)
      res.send(result.rows);
    else
      console.log("error occured");
  });
});

var server = http.createServer(app);
server.listen(PORT,IP_ADDRESS);
console.log("Server started at port : ", PORT);
