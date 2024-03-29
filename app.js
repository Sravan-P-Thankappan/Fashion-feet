
require('dotenv').config()

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars')
var db = require('./configuration/connection')
var session = require('express-session');


var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var userLoginRouter = require('./routes/user/userlogin');

const oneDay = 1000*60*60*24;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials'}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret:"key",
  saveUninitialized:false,
  resave:false,
  cookie:{maxAge: oneDay}
}))


app.use((req, res, next) => {
  if (!req.user) {
    res.header("cache-control", "private,no-cache,no-store,must revalidate");
    res.header("Express", "-3");
  }
  next();
});

// database connection 
// database connection should be given before routing
db.connect((err)=>
{
  if(err) console.log("Error");
  else console.log("Database connected");
})

app.use('/', userRouter);

app.use('/loginfail',userLoginRouter )

app.use('/admin',adminRouter ) 



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  // next(createError(404));
  res.status(400).render('error')
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);

  res.render('server-error');
   

});

module.exports = app;
