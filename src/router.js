var app = require('./app.js');

module.exports = function (client) {
    return function (req, res, next) {
        req.getClient = function () {
            return client;
        };
        app(req, res, next);
    }
};