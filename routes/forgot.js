var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var router = express.Router();
var Users = require('../models/users');
var nodemailer = require('nodemailer');
var crypto = require('crypto');

router.get('/', function (req, res) {
    res.render('forgot', data = { // todo
        title: "Password Recovery | Project Gate",
        msg: req.session.msg
    });
});

router.post('/', function (req, res) {
    Users.findOne({
        email: req.body.email
    }, function (err, result) {
        if (!result || err) {
            console.log(err);
        } else if (result) {
            var token = crypto.randomBytes(20).toString('hex');
            Users.update({
                _id: result.id
            }, {
                resetPasswordToken: token,
                resetPasswordExpires: Date.now() + 3600000
            }, function (err, user) {
                if (err) {
                    // todo Error handling system tähän
                    console.log(err);
                }
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'pwrecovprg@gmail.com',
                        pass: 'Salasana123'
                    }
                });
                var mailOptions = {
                    from: 'pwrecovprg@gmail.com',
                    to: 'pwrecovprg@gmail.com',
                    subject: 'Passwordreset',
                    text: 'localhost:3000/reset/' + token
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    }
                });
            });

        }
    });
    res.redirect('/');
});
module.exports = router;