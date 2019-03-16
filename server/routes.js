'use strict';
const express = require('express');
const router = express.Router();
const users = require('./data');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });

router.get('/icebreaker', (req, res) => {
	res.render('icebreaker');
});

// Routes
router.get('/', (req, res) => {
	res.render('index', {
		title: 'Dating app',
		users
	});
});

router.get('/users/:id', (req, res) => {
	const id = req.params.id;
	res.render('profile', {
		title: 'Profile',
		users,
		id
	});
});


// Get data from icebreaker
let iceBreakerData = [];

router.post('/icebreaker', urlencodedParser, function (req, res) {
	if (!req.body) return res.sendStatus(400);
	iceBreakerData.push({
		q1: req.body.q1,
		q2: req.body.q2,
		q3: req.body.q3
	});
	res.render('index-test-data', {
		iceBreakerData,
		users
	});
});


module.exports = router;


