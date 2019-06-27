var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var app = express();
var Projects = require('../models/projects');
var Users = require('../models/users');
var moment = require('moment');
var middle = require("workTime.js");

app.get('/', function (req, res) {
	Projects.find({
		$or: [{
			"participants.participant": req.session.userid
		}, {
			manager: req.session.userid
		}]
	}, function (err, result) {
		if (err) throw err;
		res.render('index', {
			title: 'Home | Project Gate',
			data: result,
			user: req.session.user,
			name: req.session.name,
			msg: req.session.msg,
			privilege: req.session.privilege,
			moment: moment,
			date: middle.getDate(),
			time: middle.getCurrentTime(),
			wTime: middle.getWorkingTime()
		});
	});
});

module.exports = app;
