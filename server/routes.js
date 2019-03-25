'use strict';
const express = require('express');
const router = express.Router();
const data = require('./data');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const app = express();
const User = require('../models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Root
router.get('/', (req, res) => {
	res.render('index', {
		data
	});
});

// Profile
router.get('/profile', (req, res) => {
	res.render('profile', {
		data
	});
});

// Profile
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


router.post('/register', (req, res) => {
	const name = req.body.name;
	const email = req.body.email;
	const username = req.body.username;
	const password = req.body.password;
	const password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	// req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	const errors = req.validationErrors();

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
	passport.authenticate('local',
		{
			successRedirect: '/',
			failureRedirect: '/login',
			failureFlash: true
		}),
	function (req, res) {
		s;
		res.redirect('/');
	});


router.get('/logout', function (req, res) {
	req.logout();
	req.flash('succes_msg', 'You are logged out');
	res.redirect('/login');
});




// Creates schema for a user
// const UserSchema = new mongoose.Schema({
// 	email: {
// 		type: String,
// 		unique: true,
// 		required: true,
// 		trim: true
// 	},
// 	username: {
// 		type: String,
// 		unique: true,
// 		required: true,
// 		trim: true
// 	},
// 	password: {
// 		type: String,
// 		required: true,
// 	},
// 	passwordConf: {
// 		type: String,
// 		required: true
// 	}
// });

// Adds prehook to the userschema and makes a hash of the password to make it more descriptive
// UserSchema.pre('save', function (next) {
// 	const user = this;
// 	bcrypt.hash(user.password, 10, function (err, hash) {
// 		if (err) {
// 			return next(err);
// 		}
// 		user.password = hash;
// 		next();
// 	});
// });


// const User = mongoose.model('User', UserSchema);


// Post data from register form to db
// router.post('/account', urlencodedParser, (req, res, next) => {
// 	if (!req.body) return res.sendStatus(400);

// 	const userData = {
// 		email: req.body.email,
// 		username: req.body.username,
// 		password: req.body.password,
// 	};

// 	User.create(userData, function (err, user) {
// 		res.render('index', {
// 			data
// 		});
// 	});

// });


// UserSchema.statics.authenticate = function (email, password, callback) {
// 	User.findOne({ email: email })
// 		.exec(function (err, user) {
// 			if (err) {
// 				return callback(err);
// 			} else if (!user) {
// 				const err = new Error('User not found.');
// 				err.status = 401;
// 				return callback(err);
// 			}
// 			bcrypt.compare(password, user.password, function (err, result) {
// 				if (result === true) {
// 					return callback(null, user);
// 				} else {
// 					return callback();
// 				}
// 			});
// 		});
// };


// router.post('/account', urlencodedParser, (req, res, next) => {
// 	if (!req.body) return res.sendStatus(400);

// 	if (req.body.email &&
// 		req.body.username &&
// 		req.body.password &&
// 		req.body.passwordConf) {

// 		var userData = {
// 			email: req.body.email,
// 			username: req.body.username,
// 			password: req.body.password,
// 		};

// 		User.create(userData, function (error, user) {
// 			if (error) {
// 				return next(error);
// 			} else {
// 				req.session.userId = user._id;
// 				return res.redirect('/profile');
// 			}
// 		});

// 	} else if (req.body.logemail && req.body.logpassword) {
// 		User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
// 			if (error || !user) {
// 				var err = new Error('Wrong email or password.');
// 				err.status = 401;
// 				return next(err);
// 			} else {
// 				req.session.userId = user._id;
// 				return res.redirect('/');
// 			}
// 		});
// 	} else {
// 		var err = new Error('All fields required.');
// 		err.status = 400;
// 		return next(err);
// 	}

// });








// const passportLocalMongoose = require('passport-local-mongoose');
// User.plugin(passportLocalMongoose);










// app.use(session({
// 	secret: 'work hard',
// 	resave: true,
// 	saveUninitialized: false
// }));

module.exports = router;


