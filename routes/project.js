var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var router = express.Router();
var expressSanitized = require('express-sanitize-escape');
var Projects = require('../models/projects');
var Users = require('../models/users');
var mongoose = require('mongoose');
var moment = require('moment');
var Skillcategories = require('../models/skillcategories');
var nodemailer = require('nodemailer');

router.get('/manage', function (req, res, next) {
    res.redirect('/projects');
});

router.get('/', function (req, res) {
    res.redirect('/projects');
});

router.get('/:id', function (req, res) {
    Projects.findById(req.params.id)
        .populate('manager')
        .populate('participants.participant')
        .populate('skills.category')
        .populate('openpositions.position')
        .populate('participants.positions.position')
        .exec(function (err, project) {
            if (err) {
                req.session.msg.push("Didn't find that project!");
                req.session.redirected = true;
                res.redirect("/project");
            } else {
                var editbutton = false;
                if (project.manager != null) {
                    if (project.manager.id == req.session.userid) {
                        editbutton = true;
                    }
                }
                if (req.session.privilege == "admin") {
                    editbutton = true;
                }
                var data = project;
                data.deadlinee = moment(data.deadline).format('DD.MM.YYYY');
                data.startdatee = moment(data.startdate).format('DD.MM.YYYY');
                Skillcategories.find({}, function (err, categories) {
                    res.render('project', {
                        title: "Projects | Project Gate",
                        data: data,
                        editbutton: editbutton,
                        msg: req.session.msg,
                        userid: req.session.userid,
                        privilege: req.session.privilege,
                        categories: categories
                    });
                });
            }
        });
});
router.get('/manage/:id', function (req, res) {
    Projects.findById(req.params.id)
        .populate('manager')
        .populate('participants.participant')
        .populate('participants.positions')
        .populate('applications.applicant')
        .populate('applications.skills.category')
        .populate('applications.positions')
        .exec(function (err, project) {
            if (err) {
                console.log(err);
                req.session.msg.push("Didn't find that project!");
                req.session.redirected = true;
                res.redirect("/project");
            } else {
                Skillcategories.find({}, function (err, result) { // Get the categories for the skills
                    var managerid;(!project.manager) ? managerid = '' : managerid = project.manager.id; // Now it doesn't give "is undefined" things
                    //ADD FOR LOOP AND BREAK
                    if (req.session.userid == managerid || req.session.privilege == "admin") {
                        res.render('managepeople', {
                            title: "Projects | Project Gate",
                            data: project,
                            msg: req.session.msg,
                            categories: result,
                            privilege: req.session.privilege
                        });
                    }
                });
            }
        });
});

router.post('/manage/:id', function (req, res) {
    // Find the project with the ID that is in the URL
    Projects.findById(req.params.id)
        .populate('manager')
        .populate('participants.participant')
        .exec(function (err, project) {
            if (err) { // If error while finding the project
                throw err;
            } else { // If no errors
                req.body.participantsemails ? participantsemails = req.body.participantsemails : participantsemails = [];

                Users.find({}, function (err, result) { // Find every user
                    var participantsjson = [];
                    var didntFind = [];
                    Skillcategories.find({}, function (err, allskillcategories) {
                        // Loop through every email gotten from post body and find corresponding userID
                        for (i = 0; i < participantsemails.length; i++) {
                            if (participantsemails[i] != '') {
                                participant = result.find(o => o.email === participantsemails[i]);
                                if (participant) {
                                    var positions = [];
                                    try { // If someone inputs stupid stuff from own html page then this ensures that the site doesn't crash  
                                        var allpositions = JSON.parse(expressSanitized.htmlDecodeBody(req.body.data));
                                    } catch (e) {
                                        req.session.msg.push("Something went wronk");
                                        req.session.redirected = true;
                                        res.redirect('back');
                                        return console.error(e);
                                    }
                                    for (var k = 0; k < allpositions[i].length; k++) {
                                        var position = '';
                                        if (allpositions[i][k] != '') {
                                            position = allskillcategories.find(o => o.name === allpositions[i][k].position);
                                            if (position) {
                                                positions.push({
                                                    position: position.id
                                                });
                                            }
                                        }
                                    }
                                    participantsjson.push({
                                        participant: participant.id,
                                        positions: positions,
                                        edit: req.body.edits[i] == 1 ? true : false
                                    });
                                } else {
                                    didntFind.push(participantsemails[i]);
                                    req.session.msg.push("No users with email " + didntFind.join(', '));
                                }
                            }
                        }
                        // If current user is project manager or admin
                        // todo If user has edit rights in participants table
                        if (req.session.userid == project.manager || req.session.privilege == "admin") {
                            // Update the participants with every participant gotten from post body
                            Projects.update({
                                _id: req.params.id
                            }, {
                                participants: participantsjson
                            }, function (err) {
                                if (err) {
                                    req.session.msg.push(err.msg);
                                    req.session.redirected = true;
                                    res.redirect('/project/' + req.params.id);
                                    return;
                                }
                                res.redirect('/project/manage/' + req.params.id);
                            });
                        } else {
                            req.session.msg.push("Rights to do that you don't have");
                            req.session.redirected = true;
                            res.redirect('/project/' + req.params.id);
                        }
                    });
                });
            }
        });
});

router.post('/apply/:id', function (req, res) {
    Users.findById(req.body.userid)
        .exec(function (err, user) {
            if (err) {
                req.session.msg.push('Something went wronk');
                req.session.redirected = true;
                res.redirect('back');
                return console.log(err);
            }
            Projects.findById(req.params.id)
                .populate('openpositions.position')
                .populate('skills.category')
                .exec(function (err, project) {
                    if (err) {
                        req.session.msg.push('Something went wronk');
                        req.session.redirected = true;
                        res.redirect('back');
                        return console.log(err);
                    }
                    var positions;
                    req.body.positions ? positions = req.body.positions : positions = [];
                    var positionjson = [];
                    var skills;
                    req.body.skills ? skills = req.body.skills : skills = [];
                    var skillsjson = [];
                    for (var k = 0; k < positions.length; k++) {
                        var position = '';
                        position = project.openpositions.find(o => o.position.name === positions[k]);
                        if (position) {
                            positionjson.push(position.position.id);
                        }
                    }
                    for (var k = 0; k < skills.length; k++) {
                        var skill = '';
                        skill = project.skills.find(o => o.name === skills[k]);
                        if (skill) {
                            skillsjson.push({
                                category: skill.category.id,
                                name: skills[k]
                            });
                        }
                    }
                    var applicationdetail = {
                        applicant: user.id,
                        positions: positionjson,
                        skills: skillsjson,
                        status: "pending",
                        applicationtext: req.body.applicationtext
                    };
                    var applications;
                    project.applications ? applications = project.applications : applications = [];
                    applications.push(applicationdetail);
                    project.applications = applications;
                    Projects.findOneAndUpdate({
                        _id: req.params.id
                    }, project, {
                        upsert: true
                    }, function (err, updatedproject) {
                        if (err) {
                            req.session.msg.push("Update didn't work");
                            req.session.redirected = true;
                            res.redirect('back');
                            return console.log(err);
                        } else {
                            res.redirect('/project/' + req.params.id);
                        }
                    });
                });
        });
});


router.post('/accept/:id', function (req, res) {
    Projects.findById(req.body.projectid)
        .exec(function (err, project) {
            var participants;
            var applicant = '';
            var positions = [];
            project.participants ? participants = project.participants : [];
            project.applications.forEach(function (application) {
                if (application.id == req.params.id) {
                    application.status = "accepted";
                    applicant = application.applicant;
                    application.positions.forEach(function (pos) {
                        positions.push({
                            position: pos
                        });
                    });
                }
            });
            var newparticipant = {
                participant: applicant,
                positions: positions
            };
            participants.push(newparticipant);
            project.participants = participants;
            Projects.findOneAndUpdate({
                _id: req.body.projectid
            }, project, {
                upsert: true
            }, function (err, updatedproject) {
                if (err) {
                    req.session.msg.push("Update didn't work");
                    req.session.redirected = true;
                    res.redirect('back');
                    return console.log(err);
                } else {
                    res.redirect('/project/manage/' + req.body.projectid);
                }
            });
            Users.findById(applicant)
                .exec(function (err, user) {
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
                        subject: "You've been accepted to \"" + project.name + "\"!",
                        text: 'Check it out by logging in!'
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        }
                    });
                });
        });
});


router.post('/reject/:id', function (req, res) {
    Projects.findById(req.body.projectid)
        .exec(function (err, project) {
            var positions = [];
            project.applications.forEach(function (application) {
                if (application.id == req.params.id) {
                    application.status = "rejected";
                }
            });
            Projects.findOneAndUpdate({
                _id: req.body.projectid
            }, project, {
                upsert: true
            }, function (err, updatedproject) {
                if (err) {
                    req.session.msg.push("Update didn't work");
                    req.session.redirected = true;
                    res.redirect('back');
                    return console.log(err);
                } else {
                    res.redirect('/project/manage/' + req.body.projectid);
                }
            });
        });
});



router.get('/delete/:id', function (req, res) {
    if (req.session.privilege == "admin") { // Check if you're an admin todo check if youre projectmanager also
        Projects.remove({
            _id: req.params.id
        }, function (err) { // And then delete the category
            if (err) {
                req.session.msg.push("Remove didn't work");
                req.session.redirected = true;
                res.redirect('back');
                return console.log(err);
            }
        });
        res.redirect('/projects');
    } else {
        res.redirect('/login');
    }
});


module.exports = router;