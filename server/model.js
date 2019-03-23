// const express = require('express');
// const router = express.Router();
// const bodyParser = require('body-parser');
// const urlencodedParser = bodyParser.urlencoded({ extended: false });
// const mongoose = require('mongoose');

// mongoose.connect('mongodb://localhost:27017/icebreaker', { useNewUrlParser: true });

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function () {
// 	console.log('Connected');
// });

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
// 	}
// });

// const User = mongoose.model('User', UserSchema);



// router.post('/account', urlencodedParser, (req, res, next) => {
// 	console.log(req.body);
// 	// if (req.body.email && req.body.username && req.body.password && req.body.passwordConf) {
// 	// 	var userData = {
// 	// 		email: req.body.email,
// 	// 		username: req.body.username,
// 	// 		password: req.body.password,
// 	// 	};
// 	// 	//use schema.create to insert data into the db
// 	// 	User.create(userData, function (err, user) {
// 	// 		if (err) {
// 	// 			return next(err);
// 	// 		} else {
// 	// 			// return res.redirect('/');
// 	// 			res.render('profile', {

// 	// 			});
// 	// 		}
// 	// 	});
// 	// }

// 	// if (!req.body) return res.sendStatus(400);

// });




// module.exports = User;