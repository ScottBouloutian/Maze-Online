var http = require('http').Server(app),
    express = require('express'),
    http = require('http'),
    path = require('path'),
    home = require('./routes/home'),
    maze = require('./routes/maze'),
    auth = require('./routes/auth'),
    dbUtils = require('./utils/dbUtils.js'),
    socketio = require('socket.io'),
    World = require('./world.js'),
    SessionSockets = require('session.socket.io'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    expressSession = require('express-session'),
    errorHandler = require('express-error-handler');

var app = express();
var myCookieParser = cookieParser('secret');
var sessionStore = new expressSession.MemoryStore();

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
//app.use(express.favicon());
//app.use(express.logger('dev'));
app.use(myCookieParser);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(expressSession({ secret: 'secret', store: sessionStore }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(errorHandler());

app.get('/', checkAuth, home.maze);
app.get('/api/maze/chunk', maze.chunk);
app.post('/api/auth/login', auth.login);
app.post('/api/auth/logout', auth.logout);

var server = http.Server(app);
server.listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});

var world = new World();

var io = socketio(server);
var sessionSockets = new SessionSockets(io, sessionStore, myCookieParser);
sessionSockets.on('connection', function(err, socket, session) {
    console.log('a user connected');
    var user;
    if(session) {
        user = session.user;
        world.addUser(user);
    }
    socket.on('disconnect', function() {
        console.log('user disconnected');
        world.removeUser(user);
    });
});

function checkAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.render('login.ejs');
    }
}
