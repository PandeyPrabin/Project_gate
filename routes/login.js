var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var router = express.Router();
var passwordHash = require('password-hash');
var Users = require('../models/users');

router.get('/', function (req, res) {
    if (req.session.user) { // If logged in
        res.redirect('/');
    } else { // If not logged in
        res.render('login', {
            title: 'Login | Project Gate',
            msg: req.session.msg
        });
    }
});

router.post('/', function (req, res) {

    // Check for errors in input
    req.assert('email', 'A valid email is required').notEmpty();
    req.assert('password', 'A valid password is required').notEmpty();
    var errors = req.validationErrors();
    var msg = '';

    if (errors) {
        req.session.msg.push(errors.msg);
        res.render('login', {
            title: 'Login | Project Gate',
            msg: req.session.msg,
            privilege: undefined
        });
    } else {
        // Initialize variables
        var email = req.body.email;


        var password = req.body.password;
        req.session.admin = undefined;
        req.session.pm = undefined;
        req.session.userid = undefined;
        // Check if user exists
        Users.findOne({
            email: email
        }, function (err, user) {
            if (err) {
                throw err;
            }
            if (user) {
                // Check if password is right
                if (passwordHash.verify(password, user.password)) {
                    req.session.user = user.email;
                    // Added session variable for full name
                    req.session.name = user.firstname + ' ' + user.lastname;

                    req.session.userid = user.id;
                    // Check what privilege user has
                    if (user.privilege == "admin") {
                        req.session.privilege = "admin";
                    } else if (user.privilege == "projectmanager") {
                        req.session.privilege = "projectmanager";
                    } else {
                        req.session.privilege = "student";
                    }

                    res.redirect('/'); // Go to front page
                } else { // If password was wrong
                    req.session.msg.push("Password wrong");
                    res.render('login', {
                        title: 'Login | Project Gate',
                        msg: req.session.msg,
                        privilege: undefined
                    });
                }
            } else {
                req.session.msg.push("User doesn't exist");
                res.render('login', {
                    title: 'Login | Project Gate',
                    msg: req.session.msg,
                    privilege: undefined
                });
            }
        });
    }
});

module.exports = router;
