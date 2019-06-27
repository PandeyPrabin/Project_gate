var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var router = express.Router();
var Projects = require('../models/projects');
var Skillcategories = require('../models/skillcategories');
var mongoose = require('mongoose');
var moment = require('moment');

router.get('/', function (req, res, next) { // If no ID is specified, reroute
    res.redirect('/projects');
});

router.get('/:id', function (req, res) { // Edit a project
    var msg = '';
    // Find current user
    Projects.findById(req.params.id)
        .populate('skills.category')
        .populate('manager')
        .exec(function (err, project) {
            if (project == null) { // No results.
                // todo errorhandling
                var err = new Error('User not found');
                err.status = 404;
                req.session.msg.push(err.msg);
            } else {
                Skillcategories.find({}, function (err, result) { // Get the categories for the skills
                    var data = project;
                    data.deadlinee = moment(project.deadline).format('MM.DD.YYYY');
                    data.startdatee = moment(project.startdate).format('MM.DD.YYYY');
                    data.enddatee = moment(project.enddate).format('MM.DD.YYYY');
                    res.render('editproject', {
                        title: "Projects | Project Gate",
                        pagetitle: "Edit Project",
                        data: project,
                        msg: req.session.msg,
                        privilege: req.session.privilege,
                        categories: result
                    });
                });
            }
        });
});

module.exports = router;