var express = require('express'),
    http = require('http'),
    path = require('path'),
    home = require('./routes/home'),
    maze = require('./routes/maze'),
    user = require('./routes/user'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    mongo = require('mongodb'),
    monk = require('monk'),
    db = monk('localhost:27017/maze-db'),
    io = require('socket.io')(http);

io.on('connection', function(socket){
  console.log('a user connected');
});

var app = express();

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.cookieParser());
    app.use(express.cookieSession({
        secret: 'secret'
    }));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
    app.use(express.errorHandler());
});

app.get('/', checkAuth, home.maze);
app.get('/api/maze/chunk', maze.chunk);
app.post('/api/user/login', user.login);
app.post('/api/user/logout', user.logout);

http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});

function checkAuth(req, res, next) {
  if (req.session.user_id) {
      next();
  } else {
      res.render('login.ejs');
  }
}
