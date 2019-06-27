var express = require('express');
var expressLayouts = require('express-ejs-layouts');
var router = express.Router();

router.get('/', function (req, res) {
    res.render('about', {
        title: "About Us | Project Gate",
        privilege: req.session.privilege,
        msg: req.session.msg
    });
});

module.exports = router;