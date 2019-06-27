var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var app = express();
var Users = require('../models/users');
var Projects = require('../models/projects');

app.get('/:id', function (req, res, next) {
    if (req.session.privilege == "admin" || req.session.userid == req.params.id) { // Check if you're an admin or own the account you are about to d1337
        Projects.find({
            $or: [{
                "participants.participant": req.params.id
            }, {
                manager: req.params.id
            }]
        }, function (err, projects) { // Find all projects
            projects.forEach(function (project) {
                var participants = project.participants;
                for (i = 0; i < participants.length; i++) {
                    if (participants[i].participant == req.params.id) {
                        participants.splice(i, 1);
                        i--;
                    }
                }
                if (project.manager == req.session.userid) {
                    var manager = req.session.userid;
                } else {
                    var manager = project.manager;
                }
                Projects.update({
                    _id: project.id
                }, {
                    participants: participants,
                    manager: manager
                }, function (err) {
                    // todo err handling
                    if (err) {
                        console.log(err);
                    }
                });
            });
            Users.remove({
                _id: req.params.id
            }, function (err) { // And then delete the category
                // todo err handling
                if (err) {
                    console.log(err);
                } else {
                    next('users');
                }
            });
        });
        if (req.session.userid == req.params.id) {
            res.redirect('/logout');
        } else {
            res.redirect('/users');
        }
    } else {
        res.redirect('/login');
    }
});

module.exports = app;