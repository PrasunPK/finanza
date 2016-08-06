var http = require('http');
var express = require('express');
var app = express();
var queryString = require('querystring');
var cookieParser = require('cookie-parser');
var urlParse = require('url-parse');
var bodyParser = require('body-parser');
var pg = require('pg');
var uuid = require('uuid');
var path = require('path');

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
app.use("/companies/assets", express.static(__dirname + '/public/assets'));
app.use(session({
    secret: uuid.v1(),
    name: uuid.v1(),
    proxy: false,
    resave: false,
    saveUninitialized: true
}));

var sess = {role:undefined, user:undefined};

var readFile = function(fileName, res){
  var options = {
            root: __dirname + '/public/',
            dotfiles: 'deny',
          };
          res.sendFile(fileName, options, function (err) {
            if (err) {
              console.log(err);
              res.status(err.status).end();
            }
   });
}

app.get('/', function(req, res){
  sess = req.session;
	res.render('index');
});

app.get('/dashboard', function(req, res){
      if (sess && sess.user){
        	readFile('dashboard.html', res);
      }else{
        res.redirect('/');
      }
});

app.get('/header',function(req,res){
      res.setHeader('x-timestamp', Date.now());
      res.setHeader('x-sent', true);
      res.setHeader('x-user', sess.user);
      res.setHeader('x-role', sess.role);
      res.send();
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
    errorMessage = 'Incorrect username | password';
		res.redirect('/?error='+errorMessage);
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

app.get('/companies', function(req,res){
  if(sess.user){
    var query = pool.query('SELECT name, nick_name, other_detail FROM company_details order by updated_at', function(err, result){ 
      if(!err)
        res.send(result.rows);
      else
        console.log("error occured");
    });
  }else{
    res.redirect('/');
  }
});

app.get('/companies/:company', function(req, res){
  if(sess.user){
    var companyName = (req.params.company).toLowerCase();
    res.setHeader('x-company-name', companyName);
    readFile('company.html', res);
  }else{
    res.redirect('/');
  }
});

app.get('/detail',function(req, res){
  if(sess.user){
    res.send();
  }else{
    res.redirect('/');
  }
});

app.get('/detail/:nickname', function(req, res){
  if(sess.user){
    var companyNickName = (req.params.nickname).toLowerCase();
    var query = pool.query('SELECT name, propeitor_name, address, phone_number FROM company_details where nick_name = $1', [companyNickName], function(err, result){ 
      if(!err)
        res.send(result.rows);
      else
        console.log("error occured");
    });
  }else{
    res.redirect('/');
  }
});

app.get('/*', function(req, res){
  res.redirect('/');
});

var server = http.createServer(app);
server.listen(PORT,IP_ADDRESS);
console.log("Server started at port : ", PORT);
