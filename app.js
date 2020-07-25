var createError  = require('http-errors'),
    express      = require('express'),
    path         = require('path'),
    cookieParser = require('cookie-parser'),
    logger       = require('morgan'),
    bodyParser   = require('body-parser'),
    mongoose     = require('mongoose'),
    session      = require('express-session'),
    passport     = require('passport'),
    flash        = require('connect-flash'),
    validator    = require('express-validator');
    //MongoStore   = require('connect-mongo')(session);
    

var indexRouter = require('./routes/index');
var userRoutes = require('./routes/user');
var blogRoutes = require('./routes/blog');

var app = express();

// Connect To Database
const mongoURI ="mongodb+srv://admin:admin123@testdb-dm870.mongodb.net/fruitables?retryWrites=true&w=majority";

mongoose.connect(mongoURI, {useNewUrlParser: true});
//mongoose.connect("mongodb://127.0.0.1:27017/shopping",{useNewUrlParser: true});
require('./config/passport');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(validator());
app.use(cookieParser());
app.use(session({
  secret: 'mysupersecret',
  resave: false,
  saveUninitialized: false,
  //store: new MongoStore({ mongooseConnection: mongoose.connection}),
  cookie: {maxAge: 180 * 60 * 1000}
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next)
{
  res.locals.login = req.isAuthenticated();
  // console.log(res);
  // console.log(res.locals);
  res.locals.session = req.session;
  next();
})

app.use('/blog', blogRoutes);
app.use('/user', userRoutes);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
