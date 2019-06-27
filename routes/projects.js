var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var app = express();
var Projects = require('../models/projects');
var Users = require('../models/users');

app.get('/', function (req, res) {
    Projects.find({}, function (err, result) {
        if (err) throw err;
        result.forEach(function (project) {
            var color= "yellow";
            if (project.status == "Completed") {
                 color = "green";
            } else if (project.status == "Ongoing") {
                 color = "red";
            } else if (project.status == "Open positions") {
                 color = "blue";
            } else {
                 color = "grey";
            }
            result.color = color;
        });
        res.render('projects', {
            title: "Projects | Project Gate",
            data: result,
            msg: req.session.msg,
            privilege: req.session.privilege
        });
    });
});

module.exports = app;