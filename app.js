const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./server/routes');
const app = express();
// const multer = require('multer');
// const mongo = require('mongodb');

// require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017/icebreaker';

// Use connect method to connect to the server
MongoClient.connect(url, function (err, db) {
	assert.equal(null, err);
	console.log('Connected successfully to server');

	// insertDocuments(db, function () {
	// 	findDocuments(db, function () {
	// 		db.close();
	// 	});
	// });

	findDocuments(db, function () {
		db.close();
	});
});


// var insertDocuments = function (db, callback) {
// 	// Get the documents collection
// 	var collection = db.collection('documents');
// 	// Insert some documents
// 	collection.insertMany([
// 		{ a: 1 }, { a: 2 }, { a: 3 }
// 	], function (err, result) {
// 		assert.equal(err, null);
// 		assert.equal(3, result.result.n);
// 		assert.equal(3, result.ops.length);
// 		console.log('Inserted 3 documents into the collection');
// 		callback(result);
// 	});
// };


// Find all arrs
var findDocuments = function (db, callback) {
	// Get the documents collection
	var collection = db.collection('documents');
	// Find some documents
	collection.find({}).toArray(function (err, docs) {
		assert.equal(err, null);
		console.log('Found the following records');
		console.log(docs);
		callback(docs);
	});
};

// Find specific key value pair
// var findDocuments = function (db, callback) {
// 	// Get the documents collection
// 	var collection = db.collection('documents');
// 	// Find some documents
// 	collection.find({ 'a': 3 }).toArray(function (err, docs) {
// 		assert.equal(err, null);
// 		console.log('Found the following records');
// 		console.log(docs);
// 		callback(docs);
// 	});
// };

// var updateDocument = function (db, callback) {
// 	// Get the documents collection
// 	var collection = db.collection('documents');
// 	// Update document where a is 2, set b equal to 1
// 	collection.updateOne({ a: 2 }
// 		, { $set: { b: 1 } }, function (err, result) {
// 			assert.equal(err, null);
// 			assert.equal(1, result.result.n);
// 			console.log('Updated the document with the field a equal to 2');
// 			callback(result);
// 		});
// };


// var removeDocument = function (db, callback) {
// 	// Get the documents collection
// 	var collection = db.collection('documents');
// 	// Delete document where a is 3
// 	collection.deleteOne({ a: 3 }, function (err, result) {
// 		assert.equal(err, null);
// 		assert.equal(1, result.result.n);
// 		console.log('Removed the document with the field a equal to 3');
// 		callback(result);
// 	});
// };


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
	extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
	next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;


