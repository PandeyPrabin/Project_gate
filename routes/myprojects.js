var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var app = express();
var Projects = require('../models/projects');
var Users = require('../models/users');
var moment = require('moment');

app.get('/', function (req, res) {
    Projects.find({
        $or: [{
            "participants.participant": req.session.userid
        }, {
            manager: req.session.userid
        }]
    }, function (err, result) {
        if (err) throw err;
        res.render('myprojects', {
            title: "My Projects | Project Gate",
            data: result,
            msg: req.session.msg,
            privilege: req.session.privilege,
            moment: moment
        });
    });
});

module.exports = app;