var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var app = express();
var Users = require('../models/users');
var Skillcategories = require('../models/skillcategories');

app.get('/', function (req, res) {
    var msg = '';
    Users.find({})
        .populate('skills.category')
        .populate('wishes.category')
        .sort({
            firstname: 1,
            lastname: 1
        })
        .exec(function (err, result) {
            if (err) throw err;
            res.render('students', {
                title: "Students | Project Gate",
                data: result,
                msg: req.session.msg,
                privilege: req.session.privilege
            });
        });
});

module.exports = app;