'use strict';
const express = require('express');
const router = express.Router();
const data = require('./data');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const User = require('../models/user');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// GET routes
router.get('/', (req, res, next) => {
	req.session.save(function (err) {
		if (err) return next(err);
		res.render('index', {
			data
		});
	});
});

router.get('/profile', (req, res) => {
	if (req.session && req.session.user) {
		res.render('my-profile', {
			data,
			user: req.user,
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
	res.render('profile', {
		data,
		id
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

// router.post('/login',
// 	passport.authenticate('local',
// 		{
// 			successRedirect: '/',
// 			failureRedirect: '/login',
// 			failureFlash: true
// 		}),
// 	function (req, res) {
// 		console.log(req.user);
// 		res.redirect('/');
// 	});

router.post('/login',
	passport.authenticate('local'), function (req, res) {
		// If this function gets called, authentication was successful.
		// `req.user` contains the authenticated user.
		console.log(req.user);
		req.session.user = req.user;
		res.render('my-profile', {
			data,
			user: req.user,
			iceBreakerData: { images: [] }
		});
		// res.redirect('profile', { user: req.user });
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


