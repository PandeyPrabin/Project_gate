var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var router = express.Router();
var passwordHash = require('password-hash');
var Users = require('../models/users');

router.get('/', function (req, res) {
    Users.findById(req.session.userid)
        .exec(function (err, user) {
            res.render('settings', {
                title: "Settings | Project Gate",
                msg: req.session.msg,
                user: req.session.userid,
                privilege: req.session.privilege,
                data: user
            });
        });
});

router.post('/', function (req, res) {
    data = {};
    Users.findOne({
        '_id': req.session.userid
    }, function (err, user) {
        if (req.body.password || req.body.newpassword || req.body.email) {

            if (err) throw err; // todo errorhandling
            if (user) {
                // Check if password is right
                if (!passwordHash.verify(req.body.password, user.password)) {
                    req.session.msg.push("Wrong password");
                    req.session.redirected = true;
                    res.redirect('settings');
                    return;
                } else {
                    if (req.body.newemail) {
                        data.email = req.body.newemail;
                    }
                    if (req.body.newpassword) {
                        if (req.body.newpassword == req.body.newpasswordagain) {
                            data.password = passwordHash.generate(req.body.newpassword);
                        }
                    }
                }


            } else {
                req.session.msg.push("We didn't find you");
                req.session.redirected = true;
                res.redirect('settings');
                return;
            }
        } else {
            // tähän ne täppäupdatet
        }
        Users.findOneAndUpdate({
            '_id': req.session.userid
        }, data, function () {
            if (data.password) {
                res.redirect('logout');
            } else {
                res.render('settings', {
                    title: "Settings | Project Gate",
                    msg: req.session.msg,
                    user: req.session.userid,
                    privilege: req.session.privilege,
                    data: user
                });
            }
        });
    });
});
module.exports = router;