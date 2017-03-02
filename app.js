var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');



var multer  = require('multer');

var routes = require('./routes/index');
var users = require('./routes/users');
var test = require('./routes/test');
var tasks= require('./routes/tasks');

var start_test = require('./routes/start');

var uploads = require('./routes/uploads');
//var signin = require('./routes/signin');
var answers = require('./routes/answers');
var evaluate = require('./routes/evaluate');
var sync = require('./routes/sync');
var feedback = require('./routes/feedback');

// User management imports:
var passport = require('passport');
var flash = require('connect-flash');

var u = require('./routes/u');

var base_url=(process.env.BASE_URL || '');

// A little help from:
// https://orchestrate.io/blog/2014/06/26/build-user-authentication-with-node-js-express-passport-and-orchestrate/
//var config = require('./config.js'); //config file contains all tokens and other private info
//var funct = require('./functions.js'); //funct file contains our helper functions for our Passport and database work

var session = require('express-session');

var app = express();




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ extended: true }));


// Session control: User information in cookies etc?
/*
app.use(session({ secret: 'keyboard cat',
                  saveUninitialized: true,
                  resave: true,
		  //cookie: { maxAge: 3600000 }})); // Cookie lifetime: 1 hour
		  cookie: { maxAge: 60000 }})); // Cookie lifetime: 1 minute

app.use(cookieParser());
*/

//app.use(express.static(path.join(__dirname, 'public')));


/*
 *     FLASH MESSAGES
 *
 */



// Flash messages:
app.use(flash());




/*
 *     AUTHENTICATION
 *
 */



app.use(passport.initialize());
app.use(passport.session());

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;






/*
 *     LANGUAGE
 *
 */


// Specify language of the UI:
app.use(function(req,res,next){
    req.ui_language= 'en_uk';
    next();
});





/*
 *     UPLOADS WITH MULTIPART FORMS
 *
 */


/*Configure the multer.*/

app.use(multer({ dest: './uploads/',
 rename: function (fieldname, filename) {
    return filename+Date.now();
  },
onFileUploadStart: function (file) {
  console.log(file.originalname + ' is starting ...')
},
onFileUploadComplete: function (file) {
  console.log(file.fieldname + ' uploaded to  ' + file.path)
  done=true;
}
}));





/*
 *     ROUTING
 *
 */



//STATIC FILES
app.use(express.static('public'))





app.get('/logout', function logout(req, res){
  if(req.isAuthenticated()){
      req.logout();
      req.flash('success', 'Uloskirjautuminen onnistui');
  }
  res.redirect(base_url+'/');
});

/*
app.get('/logout', function(req, res, next) {
    User.find({}, function(err, user) {        
	res.render('/', { title: 'Express',
			      user: req.user ,
			      ui_language: req.ui_language,
			      base_url: req.base_url,
			      error_message: req.flash('error'),
			      success_message: req.flash('success'),
			      all_users : user
			    });
    });
});
*/



app.get('/welcome', function(req, res, next) {
    User.find({}, function(err, user) {

	res.render('login', { title: 'Digitala @ Interspeech16',
			      user: req.user ,
			      ui_language: req.ui_language,
			      base_url: req.base_url,
			      all_users : user
			    });
    });
});



app.use(session({ secret: 'keyboard cat',
                  saveUninitialized: true,
                  resave: true,
		  //cookie: { maxAge: 3600000 }})); // Cookie lifetime: 1 hour
		  cookie: { maxAge: 60000 }})); // Cookie lifetime: 1 minute

app.use(cookieParser());

app.use('/start', start_test);




//console.log("If auth fails, redirect to "+base_url+"/welcome");

app.post('/login', function(req,res,next) {

    var username = req.body.username;

    console.log(username)

    if (typeof(username)=='undefined') {

	    res.render('login', { title: 'Digitala @ Interspeech16',
				  user: req.user ,
				  base_url: req.base_url,
				  error_message: 'Could not find results for code '+username,
				});	

    }

    else {
	fs.readdir( 'classification_data/results_charts/',  function (err, files){
	    
	    var re = new RegExp(username,"g");
	    
	    var resultchart = files.filter(function(item){
		return re.test(item);
	    }).length;
	    
	    if (resultchart > 0) {
		res.redirect(base_url+'/u/'+username +'/results');
	    }	  
  
	    else {
		res.render('login', { title: 'Digitala @ Interspeech16',
				  user: req.user ,
				      base_url: req.base_url,
				      error_message: 'Could not find results for code '+username,
				    });
	    }
	});
    }
});
/*
app.use(function(req,res,next){
    console.log(req.user);
    next();
});
*/

// app.use('/login', login);
//app.use('/signin', auth);


// Require authentication for the other urls:

/*
app.use(function(req,res,next){
    if(!req.isAuthenticated()) {
	console.log('user not logged in');
	
	res.redirect(base_url+'/welcome');

    }
    else {
	console.log('user logged in', req.user.username);
	sess = req.session;
	if (typeof(sess.username) !== 'undefined')
	{
	    req.params.user = sess.username;
	}
	next();
    }
});
*/


app.use('/test', test);




//app.use(ensureAuthenticated);
/*
app.use('/users', users);

app.use('/tasks', tasks);
app.use('/sync', sync);
app.use('/feedback', feedback);
*/
app.use('/upload', uploads);
//app.use('/answers', answers);
//app.use('/evaluate', evaluate);


app.use('/u', u);
app.use('/', routes);



/*
 *    ERROR HANDLING
 *
 */


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
else {
    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
	    message: err.message,
	    error: {}
	});
    });
}

module.exports = app;
