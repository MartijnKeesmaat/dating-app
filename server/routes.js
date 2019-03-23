'use strict';
const express = require('express');
const router = express.Router();
const data = require('./data');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const mongoose = require('mongoose');

router.get('/icebreaker', (req, res) => {
	res.render('icebreaker');
});

// Routes
router.get('/', (req, res) => {
	res.render('index', {
		data
	});
});

router.get('/profile', (req, res) => {
	res.render('profile-resp', {
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




mongoose.connect('mongodb://localhost:27017/icebreaker', { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log('Connected');
});

const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: true,
		required: true,
		trim: true
	},
	username: {
		type: String,
		unique: true,
		required: true,
		trim: true
	},
	password: {
		type: String,
		required: true,
	}
});

const User = mongoose.model('User', UserSchema);



router.post('/account', urlencodedParser, (req, res, next) => {
	if (!req.body) return res.sendStatus(400);
	// console.log(req.body);
	// if (req.body.email &&
	// 	req.body.username &&
	// 	req.body.password &&
	// 	req.body.passwordConf) {
	console.log(req.body);

	const userData = {
		email: req.body.email,
		username: req.body.username,
		password: req.body.password,
	};

	User.create(userData, function (err, user) {
		res.render('index', {
			data
		});
	});
	//use schema.create to insert data into the db
	// }
	db.find();
});

module.exports = router;


