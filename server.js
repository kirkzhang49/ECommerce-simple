var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var ejs_mate = require('ejs-mate');
var session = require('express-session');
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');

var secret = require('./config/secret');
var User = require('./models/user');
var Category = require('./models/category');

var app = express();

mongoose.Promise = global.Promise;
mongoose.connect(secret.database,function(err){
  if (err) console.log(err);
  else console.log("Connect to database ")
})
//Middleware
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized:true,
  secret:secret.secretKey,
  store:new MongoStore({url: secret.database, autoReconnect: true})
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res,next){
  res.locals.user = req.user;
  next();
});

app.use(function(req,res,next){
  Category.find({},function(err,categories){ //{} means search anythings
    if (err) return next(err);
    res.locals.categories = categories;//get all categories
    next();
  });
});
app.engine('ejs',ejs_mate);
app.set('view engine','ejs');


// app.get('/',function(req,res){
//   var name = "Kirk";
//   res.json("My name is " + name );
// })
var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');
var adminRoutes = require('./routes/admin');
var apiRoutes = require('./api/api');

app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use('/api',apiRoutes);

app.listen(secret.port,function(err)
{
  //if (err) throw err;
  console.log("Server is Running on port" + secret.port);
});
