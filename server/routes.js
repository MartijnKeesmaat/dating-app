'use strict';
const express = require('express');
const router = express.Router();
const data = require('./data');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });

router.get('/icebreaker', (req, res) => {
	res.render('icebreaker');
});

// Routes
router.get('/', (req, res) => {
	res.render('index', {
		data
	});
});

router.get('/users/:id', (req, res) => {
	const id = req.params.id;
	res.render('profile', {
		data,
		id
	});
});


// Get data from icebreaker
let iceBreakerData = {
	images: []
};

router.post('/icebreaker', urlencodedParser, (req, res) => {
	if (!req.body) return res.sendStatus(400);
	iceBreakerData.images = []; // reset data
	iceBreakerData.images.push(
		`/images/${req.body.q1}.jpg`,
		`/images/${req.body.q2}.jpg`,
		`/images/${req.body.q3}.jpg`
	);
	res.render('profile-resp', {
		iceBreakerData,
		data
	});
});


module.exports = router;


