const express = require('express');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./server/routes');
const app = express();
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const createError = require('http-errors');

// Connect to DB with Mongoose
const url = 'mongodb://localhost:27017/icebreaker';
mongoose.connect(url, { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log('Connected');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.set('trust proxy', 1); // trust first proxy
app.use(session({
	secret: 'keyboard poodle',
	resave: false,
	saveUninitialized: true
}));

app.use(session({ secret: 'secret' }));


app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
	errorFormatter: function (param, msg, value) {
		const namespace = param.split('.'), root = namespace.shift();
		let formParam = root;
		while (namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param: formParam,
			msg: msg,
			value: value
		};
	}
}));

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


