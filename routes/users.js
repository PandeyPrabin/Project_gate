var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var app = express();
var Users = require('../models/users');
var Projects = require('../models/projects');

app.get('/', function (req, res) {
    var msg = '';
    Users.find({})
        .populate('skills.category')
        .populate('wishes.category')
        .sort({
            lastname: 'asc',
            firstname: 'asc'
        })
        .exec(function (err, result) {
            if (err) throw err;
            res.render('users', {
                title: "Users | Project Gate",
                data: result,
                msg: req.session.msg,
                privilege: req.session.privilege
            });
        });
});

module.exports = app;