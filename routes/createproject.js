var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var router = express.Router();
var Users = require('../models/users');
var Projects = require('../models/projects');
var moment = require('moment');
var Skillcategories = require('../models/skillcategories');
var multipart = require('connect-multiparty');
var fs = require('fs');
var Jimp = require("jimp");
var expressSanitized = require('express-sanitize-escape');
router.use(expressSanitized.middleware());
expressSanitized.sanitizeParams(router, ['id']);

router.get('/', function (req, res) { // Front page of /createproject

    if (req.session.privilege != 'student') { // If user has right to make projects
        Skillcategories.find({}, function (err, result) { // Get the categories for the skills
            data = {
                id: 'create',
                name: '',
                description: '',
                manager: '',
                status: '',
                deadline: '',
                startdate: '',
                enddate: '',
                skills: [],
                openpositions: []
            };
            res.render('editproject', {
                title: "Projects | Project Gate",
                pagetitle: "Create Project",
                msg: req.session.msg,
                data: data,
                privilege: req.session.privilege,
                categories: result
            });
        });
    } else {
        res.redirect('/projects');
    }
});

router.post('/:id', multipart(), function (req, res) { // If the form has been submitted
    if (req.session.privilege != 'student') { // If user has no right to make projects           
        if (req.params.id == 'create') { // If we have the saved variable
            var projectid = '';
            var pagetitle = "Create Project";
        } else {
            var projectid = req.params.id;
            var pagetitle = "Edit Project";
        }
        // Check for errors in input
        req.assert('name', 'A valid project name is required').notEmpty();
        req.assert('manager', 'A valid project manager is required').notEmpty();
        req.assert('description', 'A valid description is required').notEmpty();
        req.assert('status', 'A valid status is required').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            errors.forEach(function (error) {
                req.session.msg.push(error.msg);
            });
            req.session.redirected = true;
            res.redirect('/createproject/' + projectid);
        } else {
            // Search for the user specified as manager
            Users.findOne({
                email: req.body.manager
            }, function (err, users) {
                if (err) {
                    throw err;
                } else {
                    // Get all the skillz
                    Skillcategories.find({}, function (err, result) {
                        if (users) { // If the user exists
                            if (req.body.skillsname) {
                                var skillsname = req.body.skillsname; // These are in format: [ '123', '234', '', '345' ]
                                var skillscategory = req.body.skillscategory;
                            } else {
                                var skillsname = [];
                            }
                            if (req.body.positions) {
                                var positions = req.body.positions;
                            } else {
                                var positions = [];
                            }
                            var json = [];
                            let category = '';
                            var j = 0;
                            // Format into: [ { name: '123' }, { name: '234' }, { name: '345' } ]
                            // and delete empty entries
                            for (i = 0; i < skillsname.length; i++) {
                                if (skillsname[i] != '') {
                                    category = result.find(o => o.name === skillscategory[i]);
                                    if (category) {
                                        json[j] = {
                                            name: skillsname[i],
                                            category: category.id
                                        };
                                        j++;
                                    }
                                }
                            }
                            var positionjson = [];
                            // Format into: [ { name: '123', category: '2342' }, ...
                            for (i = 0; i < positions.length; i++) {
                                let position = '';
                                var j = 0;
                                if (positions[i] != '') {
                                    position = result.find(o => o.name === positions[i]);
                                    if (position) {
                                        positionjson.push({
                                            position: position.id
                                        });
                                    }
                                }
                            }
                            req.body.deadline ? deadline = moment(req.body.deadline, "MMMM D, YYYY").format('MM.DD.YYYY') : deadline = ''
                            req.body.startdate ? startdate = moment(req.body.startdate, "MMMM D, YYYY").format('MM.DD.YYYY') : startdate = ''
                            req.body.enddate ? enddate = moment(req.body.enddate, "MMMM D, YYYY").format('MM.DD.YYYY') : enddate = ''

                            var data = {
                                name: req.body.name,
                                description: req.body.description,
                                manager: users.id,
                                status: req.body.status,
                                deadline: deadline,
                                startdate: startdate,
                                enddate: enddate,
                                skills: json,
                                openpositions: positionjson
                            };
                            if (projectid == '') { // If we were creating
                                // Insert data
                                var project = new Projects(data);
                                project.save(function (err, project) {
                                    if (err)
                                        req.session.msg.push("Creation didn't work");
                                    res.redirect("/project/" + project.id); // Go back to the project site
                                });
                            } else { // If we were editing
                                // Update project with new data
                                Projects.findOneAndUpdate({
                                    _id: projectid
                                }, data, {
                                    upsert: true
                                }, function (err, updatedproject) {
                                    if (err) req.session.msg.push("Update didn't work");

                                    if (req.files.image.size != 0) {
                                        var image = fs.readFileSync(req.files.image.path);
                                        filepath = "/uploads/" + projectid + ".png";
                                        fs.writeFileSync("./static" + filepath, image);

                                        Projects.update({
                                                _id: projectid
                                            }, { // Update data
                                                imagepath: filepath
                                            },
                                            function (err) {
                                                if (err) {
                                                    // todo errorhandling
                                                    throw err;
                                                }
                                            });
                                        Jimp.read("./static" + filepath, function (err, lenna) {
                                            // todo errorhandling
                                            if (err) throw err;
                                            lenna.resize(298, 282) // resize
                                                .write("./static" + filepath); // save
                                        });
                                    }
                                }).then(
                                    res.redirect("/project/" + projectid) // Go back to the project site
                                );
                            }
                        } else { // If the user doesnt exist
                            req.session.msg.push("Didn't find managers");
                            res.render('editproject', {
                                title: "Projects | Project Gate",
                                pagetitle: pagetitle,
                                msg: req.session.msg,
                                data: req.body,
                                privilege: req.session.privilege,
                                categories: result
                            });
                        }
                    });
                }
            });
        }
    } else {
        res.redirect('/projects');
    }
});

module.exports = router;