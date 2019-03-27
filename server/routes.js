'use strict';
const express = require('express');
const router = express.Router();
const data = require('./data');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const User = require('../models/user');
const mongo = require('mongodb');
const objectId = require('mongodb').ObjectID;
// const session = require('express-session');
const passport = require('passport');
const assert = require('assert');
const LocalStrategy = require('passport-local').Strategy;
const url = 'mongodb://localhost:27017/icebreaker';

// GET routes
router.get('/', function (req, res, next) {
	let users = [];
	mongo.connect(url, function (err, db) {
		assert.equal(null, err);
		const cursor = db.collection('profiles').find();
		cursor.forEach(function (doc, err) {
			assert.equal(null, err);
			users.push(doc);
		}, function () {
			db.close();
			res.render('index', {
				data,
				users
			});
		});
	});
});

router.get('/profile', (req, res) => {
	if (req.session && req.session.user) {
		res.render('my-profile', {
			data,
			user: req.session.user,
			iceBreakerData: { images: [] }
		});
	}
	else {
		res.redirect('login');
	}
});

router.get('/login', (req, res) => {
	res.render('login', {
		data
	});
});

router.get('/register', (req, res) => {
	res.render('register', {
		data
	});
});

router.get('/users/:id', (req, res) => {
	const id = req.params.id;
	let users = [];
	mongo.connect(url, function (err, db) {

		// Check for errors
		assert.equal(null, err);

		// Check collection and push to users arr
		const cursor = db.collection('profiles').find();
		cursor.forEach(function (doc, err) {
			assert.equal(null, err);
			users.push(doc);
		}, function () {
			db.close();

			// Filter profiles on ID
			let user = users.filter(i => i._id == id);
			user = user[0];

			// Render page with data
			res.render('profile', {
				user
			});
		});
	});
});


router.post('/update', function (req, res, next) {
	var newContent = {
		name: req.body.name,
		job: req.body.job,
		intro: req.body.intro
	};

	req.user = {
		name: req.body.name,
		job: req.body.job,
		intro: req.body.intro
	};
	console.log(req.user.job);

	mongo.connect(url, function (err, db) {
		assert.equal(null, err);
		db.collection('users').updateOne({ '_id': objectId(req.user._id) }, {
			$set: newContent,
		}, function (err, result) {
			assert.equal(null, err);
			db.close();
		});
	});

	console.log(newContent);
	console.log(req.user);
	console.log(req.session.user);

	// res.render('my-profile', {
	// 	data,
	// 	user: req.user,
	// 	iceBreakerData: { images: [] }
	// });
	req.session.reload(function (err) {
		// res.render('index', { title: req.session.example });
		req.session.user = req.user;
		res.redirect('/profile');
	});
});



// Create account
router.post('/register', (req, res) => {
	const name = req.body.name;
	const email = req.body.email;
	const username = req.body.username;
	const password = req.body.password;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();

	// Set session info
	req.session.name = name;
	req.session.email = email;
	req.session.password = password;
	const errors = req.validationErrors();

	// Create user in db
	if (errors) {
		res.render('register', {
			errors
		});
	} else {
		const newUser = new User({
			name,
			email,
			username,
			password
		});
		User.createUser(newUser, function (err, user) {
			if (err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now log in');
		res.redirect('/login');
	}
});

// Login with username and password
passport.use(new LocalStrategy(
	function (username, password, done) {
		User.getUserByUsername(username, function (err, user) {
			if (err) throw err;
			if (!user) {
				return done(null, false, { message: 'Unknown user' });
			}
			User.comparePassword(password, user.password, function (err, isMatch) {
				if (err) throw err;
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, { message: 'Invalide password' });
				}
			});
		});
	}));


passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.getUserById(id, function (err, user) {
		done(err, user);
	});
});


router.post('/login',
	passport.authenticate('local'), function (req, res) {
		req.session.user = req.user;
		res.redirect('/profile');
	});

router.get('/logout', function (req, res) {
	req.logout();
	req.flash('succes_msg', 'You are logged out');
	res.redirect('/login');
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
	res.render('my-profile', {
		iceBreakerData,
		data,
		// user: req.user,
		user: {
			name: 'Martijn Keesmaat'
		}
	});
});

module.exports = router;


