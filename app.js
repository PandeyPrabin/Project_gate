var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var path = require('path');
var http = require('http');
var expressValidator = require('express-validator');
var expressSanitized = require('express-sanitize-escape');
var session = require('express-session');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var multipart = require('connect-multiparty');
var fs = require('fs');

var app = express();

// Database connection
/* This is the old database 
var mongoDB = "mongodb://databaseboi:Salasana123@ds119080.mlab.com:19080/projektgate"; */ // Change this to your database in mlab

//var mongoDB = "mongodb://projectgateteam:passwordpassword123@ds016098.mlab.com:16098/project_gate"; // Change this to your database in mlab
//var mongoDB = 'mongodb://localhost:27017/project_gate'; // Change this to your database in mlab

//mongoose.connect('mongodb://localhost:27017/project_gate',{useNewUrlParser: true});
mongoose.connect('mongodb+srv://Prabin:TurkuFinland@prabin-5muhx.mongodb.net/test?retryWrites=true', {useNewUrlParser: true});

mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongodb conenctino erroor:'));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json({
    type: 'application/*+json'
}));
// Options here in comments of https://github.com/fingerfoodstudios/express-sanitize-escape/blob/master/test/express-sanitize-escape.spec.js
app.use(expressSanitized.middleware({
    encoder: 'XSSEncode',
    sanitize: true
}));
app.use(expressValidator());
app.use(express.static(path.join(__dirname + '/static')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000
    }
}));

function checkauth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

function accessdenied(req, res) {
    if (req.session.user) {
        req.session.msg.push("Access denied, not enough minerals");
        req.session.redirected = true;
        res.redirect('back');
    } else {
        res.redirect('/login');
    }
}

app.all('*', multipart(), function (req, res, next) {
    if (req.path === '/login' || req.path === '/register' || req.path === '/forgot' || req.path.startsWith("/reset")) {
        req.session.redirected ? true : req.session.msg = [];
        req.session.redirected = false;
        next();
    } else {
        if ((req.path.startsWith("/skillcategories") ||
                req.path.startsWith("/users")) && req.session.privilege != "admin") {
            accessdenied(req, res);

        } else if ((req.path.startsWith("/createproject") ||
                req.path.startsWith("/editproject") ||
                req.path.startsWith("/students") ||
                req.path.startsWith("/project/manage")) && (req.session.privilege != "admin" && req.session.privilege != "projectmanager")) {
            accessdenied(req, res);

        } else {
            req.session.redirected ? true : req.session.msg = [];
            req.session.redirected = false;
            checkauth(req, res, next);
        }
    }
});

// Require all the route files
var index = require('./routes/index');
var login = require('./routes/login');
var logout = require('./routes/logout');
var projects = require('./routes/projects');
var project = require('./routes/project');
var students = require('./routes/students');
var about = require('./routes/about');
var settings = require('./routes/settings');
var register = require('./routes/register');
var forgot = require('./routes/forgot');
var profile = require('./routes/profile');
var createproject = require('./routes/createproject');
var editproject = require('./routes/editproject');
var skillcategories = require('./routes/skillcategories');
var users = require('./routes/users');
var myprojects = require('./routes/myprojects');
var reset = require('./routes/reset');
var deleteuser = require('./routes/deleteuser');
var suggest = require('./routes/suggest');

var server = http.createServer(app);

// All the routes from URL
app.use('/', index);
app.use('/login', login);
app.use('/logout', logout);
app.use('/projects', projects);
app.use('/project', project);
app.use('/students', students);
app.use('/about', about);
app.use('/settings', settings);
app.use('/register', register);
app.use('/forgot', forgot);
app.use('/profile', profile);
app.use('/createproject', createproject);
app.use('/editproject', editproject);
app.use('/skillcategories', skillcategories);
app.use('/users', users);
app.use('/myprojects', myprojects);
app.use('/reset', reset);
app.use('/deleteuser', deleteuser);
app.use('/suggest', suggest);

server.listen(3000, function () {
    console.log('Server running at port 3000: http://127.0.0.1:3000');
});

module.exports = app;