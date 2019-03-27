'use strict';
const express = require('express');
const router = express.Router();
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
const multer = require('multer');
const path = require('path');

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
				users
			});
		});
	});
});

router.get('/profile', (req, res) => {
	if (req.session && req.session.user) {
		res.render('my-profile', {
			user: req.session.user,
			iceBreakerData: { images: [] }
		});
	}
	else {
		res.redirect('login');
	}
});

router.get('/login', (req, res) => {
	res.render('login');
});

router.get('/register', (req, res) => {
	res.render('register');
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
	const newContent = {
		name: req.body.name,
		job: req.body.job,
		intro: req.body.intro
	};

	req.session.user = {
		name: req.body.name,
		job: req.body.job,
		intro: req.body.intro,
		displayImage: 'https://thumbs-prod.si-cdn.com/i-3LZKwzNwECUGnryG_Kt_KjiPo=/800x600/filters:no_upscale():focal(416x178:417x179)/https://public-media.si-cdn.com/filer/19/ec/19ec2712-c520-4e9f-ad37-0f3b5a19a3ec/peter_der-grosse_1838.jpg',
		gallery: ['https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Young_Peter_the_Great_parsuna_%28cropped%29.jpg/220px-Young_Peter_the_Great_parsuna_%28cropped%29.jpg', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Deathbed_portrait_of_Peter_I_by_I.Nikitin_%281725%2C_Russian_museum%29.jpg/170px-Deathbed_portrait_of_Peter_I_by_I.Nikitin_%281725%2C_Russian_museum%29.jpg', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Peter_I_by_Kneller.jpg/220px-Peter_I_by_Kneller.jpg']
	};

	mongo.connect(url, function (err, db) {
		assert.equal(null, err);
		db.collection('users').updateOne({ '_id': objectId(req.user._id) }, {
			$set: newContent,
		}, function (err, result) {
			assert.equal(null, err);
			db.close();
		});
	});

	res.redirect('/profile');
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
	console.log(req.session.user);
	res.render('my-profile', {
		iceBreakerData,
		user: req.session.user
	});
});



// Set storage engine
const storage = multer.diskStorage({
	destination: './public/uploads/',
	filename: function (req, file, callback) {
		callback(null, file.originalname + '-' + Date.now() + path.extname(file.originalname));
	}
});

// Init upload variable
const upload = multer({
	storage,
	fileFilter: function (req, file, callback) {
		checkFileType(file, callback);
	}
}).single('uploadImage');

function checkFileType(file, callback) {
	const filetypes = /jpeg|jpg|png|gif/;
	const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
	const mimetype = filetypes.test(file.mimetype);
	if (extname && mimetype) return callback(null, true);
}

router.post('/uploadGallery', (req, res) => {
	upload(req, res, function () {

		// Copy current gallery and add url
		let gallery = [];
		gallery.push(...req.session.user.gallery);
		const newUrl = req.file.path.replace('public', '');
		gallery.push(newUrl);

		console.log('This da new gallery');
		console.log(gallery);

		const newContent = { gallery };

		// Update url in db
		mongo.connect(url, function (err, db) {
			assert.equal(null, err);
			db.collection('users').updateOne({ '_id': objectId(req.user._id) }, {
				$set: newContent,
			}, function (err, result) {
				assert.equal(null, err);
				db.close();
			});
		});

		res.redirect('/profile');
	}); // call multer function
});

module.exports = router;


