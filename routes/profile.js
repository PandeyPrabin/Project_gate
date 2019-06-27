var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var router = express.Router();
var Users = require('../models/users');
var Skillcategories = require('../models/skillcategories');
var Projects = require('../models/projects');
var moment = require('moment');
var multipart = require('connect-multiparty');
var fs = require('fs');
var Jimp = require("jimp");
var expressSanitized = require('express-sanitize-escape');
router.use(expressSanitized.middleware());
expressSanitized.sanitizeParams(router, ['id']);

router.get('/', function (req, res) { // Current users profile
    // Find current user in database
    Users.findOne({
        email: req.session.user
    }, function (err, user) {
        if (err) {
            req.session.msg.push("We didn't find you in database. Are you a ghost?");
            req.session.redirected = true;
            res.redirect('/');
        } else { // Redirect to own profile
            res.redirect('/profile/' + user.id);
        }
    });
});

router.get('/edit', function (req, res) { // Edit profile
    // Find current user
    res.redirect('/edit/' + req.session.userid);
});

router.get('/edit/:id', function (req, res) { // Edit profile
    if (req.session.userid != req.params.id && req.session.privilege != 'admin') {
        req.session.msg.push("You have no right to tamper with other users!");
        req.session.redirected = true;
        res.redirect('back');
        return;
    }
    // Find current user
    Users.findById(req.params.id)
        .populate('skills.category')
        .populate('wishes.category')
        .exec(function (err, users) {
            if (users == null) { // No results.
                // todo errorhandling
                var err = new Error('User not found');
                err.status = 404;
                req.session.msg.push(err.msg);
            } else {
                var categories;
                Skillcategories.find({}, function (err, result) { // Get the categories for the skills
                    users.password = undefined; // undefine password so we can just send whole users as data
                    res.render('editprofile', {
                        title: "Profile | Project Gate",
                        data: users,
                        birthdate: moment(users.birthdate).format('DD.MM.YYYY'),
                        msg: req.session.msg,
                        privilege: req.session.privilege,
                        categories: result
                    });
                });
            }
        });
});

router.get('/:id', function (req, res) {
    // Find user by id from url
    Users.findById(req.params.id)
        .populate('skills.category')
        .populate('wishes.category')
        .populate('skilldev.category')
        .exec(function (err, users) {
            if (users == null) { // No results.
                // todo errorhandling
                req.session.msg.push("User not found");
                req.session.redirected = true;
                res.redirect('back');
                return;
            } else {
                users.password = undefined; // undefine password so we can just send whole users as data
                users.birthdate = moment(users.birthdate).format('DD.MM.YYYY'); // Reformat date
                var editbutton = false;
                if (users.email === req.session.user || req.session.privilege == 'admin') { // if page isn't current users page, don't show edit button
                    editbutton = true;
                }

                if (users.email != req.session.user && req.session.privilege == 'student') { // if page isn't current users page and user is student   
                    req.session.msg.push("You shall not pass!!!");
                    req.session.redirected = true;
                    res.redirect('back');
                    return;
                }
                // Find all projects that the user is participant in
                Projects.find({
                        $or: [{
                            "participants.participant": req.params.id
                        }, {
                            "manager": req.params.id
                        }]
                    })
                    .populate('participants.positions.position')
                    .exec(function (err, projects) {
                        Projects.find({
                                "suggestions.user": req.params.id
                            })
                            .populate('suggestions.positions')
                            .exec(function (err, suggestedprojects) {
                                res.render('profile', {
                                    title: 'Profile | Project Gate',
                                    data: users,
                                    privilege: req.session.privilege,
                                    msg: req.session.msg,
                                    editbutton: editbutton,
                                    userid: req.params.id,
                                    projects: projects,
                                    suggestedprojects: suggestedprojects
                                });
                            });
                    });
            }
        });
});

router.post('/edit/:id', multipart(), function (req, res) {
    if (req.session.userid != req.params.id && req.session.privilege != 'admin') {
        req.session.msg.push("Access denied, not enough minerals");
        req.session.redirected = true;
        res.redirect('back');
        return;
    }
    if (req.body.skillsname) {
        var skillsname = req.body.skillsname; // These are in format: [ '123', '234', '', '345' ]
        var skillscategory = req.body.skillscategory;
    } else {
        var skillsname = [];
    }
    if (req.body.skilldevname) {
        var skilldevname = req.body.skilldevname; // These are in format: [ '123', '234', '', '345' ]
        var skilldevcategory = req.body.skilldevcategory;
    } else {
        var skilldevname = [];
    }
    if (req.body.wishes) {
        var wishnames = req.body.wishes;
    } else {
        var wishnames = [];
    }

    var skilljson = [];
    var skilldevjson = [];
    var ratings = req.body.ratings.split(",");
    // Get all the skillz
    Skillcategories.find({}, function (err, result) {
        let category = '';
        var j = 0;
        // Skills
        // Format into: [ { name: '123' }, { name: '234' }, { name: '345' } ]
        // and delete empty entries
        for (i = 0; i < skillsname.length; i++) {
            if (skillsname[i] != '') {
                category = result.find(o => o.name === skillscategory[i]);
                if (category) {
                    skilljson.push({
                        name: skillsname[i],
                        category: category.id,
                        rating: ratings[i]
                    });
                }
            }
        }
        // Skill developement wishes
        for (i = 0; i < skilldevname.length; i++) {
            if (skilldevname[i] != '') {
                category = result.find(o => o.name === skilldevcategory[i]);
                if (category) {
                    skilldevjson.push({
                        name: skilldevname[i],
                        category: category.id
                    });
                }
            }
        }
        var wishjson = [];
        // Positions of interest
        // Format into: [ { name: '123', category: '2342' }, ...
        for (i = 0; i < wishnames.length; i++) {
            let wishname = '';
            var j = 0;
            if (wishname[i] != '') {
                wishname = result.find(o => o.name === wishnames[i]);
                wishjson.push({
                    category: wishname.id
                });
            }
        }

        if (req.body.birthdate != '') {
            birthdate = moment(req.body.birthdate, "MMMM D, YYYY").format('MM.DD.YYYY'); // Reformat date
        } else {
            birthdate = '';
        }
        if (req.session.privilege != 'admin') {
            privilege = req.session.privilege;
        } else {
            privilege = req.body.privilege;
        }
        Users.update({
                _id: req.params.id
            }, { // Update data
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                address: req.body.address,
                city: req.body.city,
                postalcode: req.body.postalcode,
                degree: req.body.degree,
                studygroup: req.body.studygroup,
                bio: req.body.bio,
                gender: req.body.gender,
                phonenum: req.body.phonenum,
                privilege: privilege,
                birthdate: birthdate,
                skills: skilljson,
                skilldev: skilldevjson,
                wishes: wishjson
            },
            function (err) {
                if (err) {
                    // todo errorhandling
                    throw err;
                }
            });
        if (req.files.image.size != 0) {
            if (req.files.image.type != 'image/jpeg' && req.files.image.type != 'image/png' && req.files.image.type != 'image/jpg') {
                req.session.msg.push("File type can be only .png, .jpg or .jpeg");
                req.session.redirected = true;
            } else {
                var image = fs.readFileSync(req.files.image.path);
                filepath = "/uploads/" + req.params.id + ".png";
                fs.writeFileSync("./static" + filepath, image);

                Users.update({
                        _id: req.params.id
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
                    if (err) throw err;
                    lenna.resize(488, 462) // resize
                        .write("./static" + filepath); // save
                });
            }
        }
        res.redirect('/profile/' + req.params.id);
    });
});
module.exports = router;