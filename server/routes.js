'use strict';
const express = require('express');
const router = express.Router();
const data = require('./data');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Root
router.get('/', (req, res) => {
	res.render('index', {
		data
	});
});

// Profile
router.get('/profile', (req, res) => {
	res.render('profile-resp', {
		data
	});
});

// User
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



// Connect to DB with Mongoose
mongoose.connect('mongodb://localhost:27017/icebreaker', { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log('Connected');
});

// Creates schema for a user
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

// Adds prehook to the userschema and makes a hash of the password to make it more descriptive
UserSchema.pre('save', function (next) {
	const user = this;
	bcrypt.hash(user.password, 10, function (err, hash) {
		if (err) {
			return next(err);
		}
		user.password = hash;
		next();
	});
});


const User = mongoose.model('User', UserSchema);


// Post data from register form to db
router.post('/account', urlencodedParser, (req, res, next) => {
	if (!req.body) return res.sendStatus(400);

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

});

module.exports = router;


