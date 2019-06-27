var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var router = express.Router();
var Skillcategories = require('../models/skillcategories');
var Users = require('../models/users');
var Projects = require('../models/projects');

router.get('/', function (req, res) {
    if (req.session.privilege == "admin") {
        Skillcategories.find({}, function (err, result) {
            if (err) throw err; // todo errorhandling
            res.render('skillcategories', {
                title: "Skill Categories | Project Gate",
                privilege: req.session.privilege,
                msg: req.session.msg,
                data: result
            });
        });
    } else {
        res.redirect('/');
    }
});
router.post('/', function (req, res) {
    if (req.session.privilege == "admin") {
        var newskill = new Skillcategories({
            name: req.body.name,
            color: req.body.color
        });
        newskill.save(function (err) {
            if (err) return handleError(err);
        });
        res.redirect('/skillcategories');
    } else {
        res.redirect('/login');
    }
});
router.get('/delete/:id', function (req, res) {
    if (req.session.privilege == "admin") { // Check if you're an admin
        Users.find({
            'skills.category': req.params.id
        }, function (err, users) { // Find all users
            // Delete all skills from all the users that use the category that will be deleted
            users.forEach(function (user) {
                var skills = user.skills;
                var wishes = user.wishes;
                for (i = 0; i < skills.length; i++) {
                    if (skills[i].category == req.params.id) {
                        skills.splice(i, 1);
                        i--;
                    }
                }
                for (i = 0; i < wishes.length; i++) {
                    if (wishes[i].category == req.params.id) {
                        wishes.splice(i, 1);
                        i--;
                    }
                }
                Users.update({
                    _id: user.id
                }, {
                    skills: skills,
                    wishes: wishes
                }, function (err) {
                    // todo err handling
                    if (err) {
                        console.log(err);
                    } else {}
                });
            });

            Projects.update({}, // Remove the skill that has our category in it and update project
                {
                    $pull: {
                        skills: {
                            category: req.params.id
                        }
                    }
                }, {
                    multi: true
                },
                function (err, data) {
                    if (err) {
                        console.log(err, data); // todo errorhandling
                    }
                }
            );
            Projects.update({}, // Remove the position that has our category in it and update project
                {
                    $pull: {
                        openpositions: {
                            position: req.params.id
                        }
                    }
                }, {
                    multi: true
                },
                function (err, data) {
                    if (err) {
                        console.log(err, data); // todo errorhandling
                    }
                }
            );
            // Shouldve done the rest of these like that but it doesnt work apparently
            Projects.find({}, function (err, projects) { // Find all projects
                projects.forEach(function (project) { // For every project
                    var participants = project.participants;
                    for (i = 0; i < participants.length; i++) { // For every participant
                        if (participants[i].positions) { // If there are positions on a participant
                            for (j = 0; j < participants[i].positions.length; j++) { // For every position
                                if (participants[i].positions[j].position == req.params.id) { // If it is the skillcategory we want to remove
                                    participants[i].positions.splice(j, 1); // Remove it from the array
                                    j--;
                                }
                            }
                        }
                    }
                    // Same here but for application positions and skills
                    var applications = project.applications;
                    for (i = 0; i < applications.length; i++) {
                        if (applications[i].positions) {
                            for (j = 0; j < applications[i].positions.length; j++) {
                                if (applications[i].positions[j] == req.params.id) {
                                    applications[i].positions.splice(j, 1);
                                    j--;
                                }
                            }
                        }
                        if (applications[i].skills) {
                            for (j = 0; j < applications[i].skills.length; j++) {
                                if (applications[i].skills[j].category == req.params.id) {
                                    applications[i].skills.splice(j, 1);
                                    j--;
                                }
                            }
                        }
                    }
                    // And then update it over the existing project
                    Projects.update({
                        _id: project.id
                    }, {
                        participants: participants,
                        applications: applications
                    }, function (err) {
                        // todo err handling
                        if (err) {
                            console.log(err);
                        } else {}
                    });
                });
            });
            Skillcategories.remove({
                _id: req.params.id
            }, function (err) { // And then delete the category
                // todo err handling
                if (err) {
                    console.log(err);
                }
            });
            res.redirect('/skillcategories');
        });
    } else {
        res.redirect('/login');
    }
});
module.exports = router;