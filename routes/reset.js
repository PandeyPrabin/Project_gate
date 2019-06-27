var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var router = express.Router();
var Users = require('../models/users');
var passwordHash = require('password-hash');

router.get('/:id', function (req, res) {
    // todo token expirement
    Users.findOne({
        resetPasswordToken: req.params.id
    }, function (err, user) {
        if (!user) {
            console.log('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('reset', data = { // todo
            title: "Password Recovery | Project Gate",
            tokenid: req.params.id,
            msg: req.session.msg
        });
    });
});
router.get('/', function (req, res) {
    res.redirect('/');
});

router.post('/:id', function (req, res) {
    // todo if pass empty
    Users.findOne({
        resetPasswordToken: req.params.id
    }, function (err, user) {
        if (!user) {
            console.log('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        var password = req.body.password;
        var passwordagain = req.body.password - again;
        if (password != passwordagain) {
            req.session.msg.push("Passwords don't match");
            res.render('register', {
                title: 'Register | Project Gate',
                msg: req.session.msg,
                privilege: undefined
            });
        } else {
            var hashedPassword = passwordHash.generate(password);
            Users.update({
                _id: user.id
            }, {
                password: hashedPassword
            }, function (err, user) {
                if (err) {
                    // todo Error handling system tähän
                    console.log(err);
                } else {
                    req.session.msg.push("Password changed (probably)");
                }
            });
        }
    });
    req.session.redirected = true;
    res.redirect('/');
});

module.exports = router;