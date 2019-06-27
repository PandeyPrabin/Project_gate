var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var app = express();
var passwordHash = require('password-hash');
var Users = require('../models/users');

app.get('/', function (req, res) {
    res.render('register', {
        title: "Register | Project Gate",
        msg: req.session.msg
    });
});

app.post('/', function (req, res) {
    req.assert('firstname', 'A valid firstname is required').notEmpty();
    req.assert('lastname', 'A valid lastname is required').notEmpty();
    req.assert('email', 'A valid email is required').notEmpty();
    req.assert('password', 'A valid password is required').notEmpty();
    req.assert('passwordagain', 'A valid password is required').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        errors.forEach(function (error) {
            console.log(error.msg);
            req.session.msg.push(error.msg);
        });
        res.render('register', {
            title: 'Register | Project Gate',
            msg: req.session.msg,
            privilege: undefined
        });
    } else {
        var email = req.body.email;
        Users.findOne({
            email: email
        }, function (err, result) {
            if (err) return handleError(err);
            if (result != null) {
                req.session.msg.push("This email is already in use");
                res.render('register', {
                    title: 'Register | Project Gate',
                    msg: req.session.msg,
                    privilege: undefined
                });
            } else {
                var password = req.body.password;
                var passwordagain = req.body.passwordagain;
                if (password != passwordagain) {
                    req.session.msg.push("Passwords don't match");
                    res.render('register', {
                        title: 'Register | Project Gate',
                        msg: req.session.msg,
                        privilege: undefined
                    });
                } else {
                    var hashedPassword = passwordHash.generate(password);

                    var userdetail = {
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        email: email,
                        password: hashedPassword
                    };

                    var user = new Users(userdetail);
                    user.save(function (err) {
                        if (err) {
                            cb(err, null);
                        }
                    });
                    req.session.msg.push("User created");
                    req.session.redirected = true;
                    res.redirect("login");
                }
            }
        });
    }
});

module.exports = app;