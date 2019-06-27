var express = require('express');
var app = express();

app.get('/', function (req, res) {
    req.session.destroy();
    res.redirect('login');
});

module.exports = app;