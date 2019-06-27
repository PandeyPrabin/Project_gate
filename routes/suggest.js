var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var app = express();
var Users = require('../models/users');
var Projects = require('../models/projects');
var Skillcategories = require('../models/skillcategories');
var nodemailer = require('nodemailer');

app.get('/:id', function (req, res) {
    Projects.find({})
        .populate('openpositions.position')
        .exec(function (err, projects) {
            if (err) {
                req.session.msg.push(err.message);
            }
            Users.findById(req.params.id, function (err, user) {
                if (err) {
                    req.session.msg.push(err.message);
                }
                Skillcategories.find({}, function (err, categories) {
                    if (err) {
                        req.session.msg.push(err.message);
                    }
                    res.render('suggest', {
                        title: "Suggest a Project | Project Gate",
                        data: user,
                        projects: projects,
                        privilege: req.session.privilege,
                        msg: req.session.msg,
                        categories: categories
                    });
                });
            });
        });
});

app.post('/:id', function (req, res) {
    Projects.findById(req.body.project, function (err, project) {
        var positions = req.body.positions.split(",");
        var details = {
            user: req.params.id,
            positions: positions,
            status: "pending"
        };
        var projectsuggestions;
        project.suggestions ? projectsuggestions = project.suggestions : [];
        projectsuggestions.push(details);
        project.suggestions = projectsuggestions;
        project.update(project, {
            upsert: true
        }, function (err, updatedproject) {
            if (err) {
                req.session.msg.push(err.message);
                console.log(err);
            } else {
                Users.findById(req.params.id)
                    .exec(function (err, user) {
                        Users.findById(req.session.userid)
                            .exec(function (err, suggester) {
                                var transporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: {
                                        user: 'pwrecovprg@gmail.com',
                                        pass: 'Salasana123'
                                    }
                                });
                                var mailOptions = {
                                    from: 'pwrecovprg@gmail.com',
                                    to: user.email,
                                    subject: suggester.firstname + " " + suggester.lastname +
                                        " suggested the project \"" + project.name + "\" to you!",
                                    text: 'Check it out from you profile'
                                };
                                transporter.sendMail(mailOptions, function (error, info) {
                                    if (error) {
                                        console.log(error);
                                    }
                                });
                            });
                    });
                req.session.redirected = true;
                req.session.msg.push("Suggested successfully!");
                res.redirect('/profile/' + req.params.id);
            }
        });
    });
});
module.exports = app;