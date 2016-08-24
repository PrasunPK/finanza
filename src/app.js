var express = require('express');
var session = require('express-session');
var queryString = require('querystring');
var cookieParser = require('cookie-parser');
var urlParse = require('url-parse');
var bodyParser = require('body-parser');
var uuid = require('uuid');
var path = require('path');
var dbManger = require('./databaseManager.js');

var app = express();

app.use(cookieParser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use("/companies/assets", express.static(__dirname + '/public/assets'));
app.use(session({
    secret: uuid.v1(),
    name: uuid.v1(),
    proxy: false,
    resave: false,
    saveUninitialized: true
}));
var sess = {role: undefined, user: undefined};


var readFile = function (fileName, res) {
    var options = {
        root: __dirname + '/../public/',
        dotfiles: 'deny'
    };

    res.sendFile(fileName, options, function (err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        }
    });
};
app.get('/', function (req, res) {
    sess = req.session;
    res.render('index');
});

app.get('/dashboard', function (req, res) {
    console.log('came here');
    if (sess && sess.user) {
        readFile('dashboard.html', res);
    } else {
        res.redirect('/');
    }
});

app.get('/header', function (req, res) {
    res.setHeader('x-timestamp', Date.now());
    res.setHeader('x-sent', true);
    res.setHeader('x-user', sess.user);
    res.setHeader('x-role', sess.role);
    res.send();
});

app.post('/login', function (req, res) {
    var url = req.body;
    if (dbManger.verifyUser(req.getClient(), url.username, url.password)) {
        sess.user = url.username;
        sess.role = dbManger.getRole(req.getClient(), sess.user);
        res.redirect('/dashboard');
    }
    else {
        errorMessage = 'Incorrect username or password';
        res.redirect('/?error=' + errorMessage);
    }
});

app.get('/logout', function (req, res) {
    sess.user = null;
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

app.get('/balances', function (req, res) {
    res.send(dbManger.getBalances(req.getClient()));
});

app.get('/companies', function (req, res) {
    if (sess.user) {
        res.send(dbManger.getCompanies(req.getClient()));
    } else {
        res.redirect('/');
    }
});

app.get('/companies/:company', function (req, res) {
    if (sess.user) {
        var companyName = (req.params.company).toLowerCase();
        res.setHeader('x-company-name', companyName);
        readFile('company.html', res);
    } else {
        res.redirect('/');
    }
});

app.get('/detail', function (req, res) {
    if (sess.user) {
        res.send();
    } else {
        res.redirect('/');
    }
});

app.get('/detail/:nickname', function (req, res) {
    if (sess.user) {
        var companyNickName = (req.params.nickname).toLowerCase();
        res.send(dbManger.getCompanyDetail(req.getClient()));
    } else {
        res.redirect('/');
    }
});

app.get('/expense', function (req, res) {
    if (sess && sess.user) {
        readFile('expense.html', res);
    } else {
        res.redirect('/');
    }
});

app.get('/expenses', function (req, res) {
    if (sess.user) {
        console.log("CLIENT" + req.getClient());
        res.send(dbManger.getExpenses(req.getClient()));
    } else {
        res.redirect('/');
    }
});

app.post('/saveExpenses', function (req, res) {
    var reqBody = req.body;
    console.log(reqBody);
    res.send({status: true});
});

app.get('/*', function (req, res) {
    res.redirect('/');
});

module.exports = app;
