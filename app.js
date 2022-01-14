var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http');
const ws = require("ws");
const { URL } = require('url');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const Game = require('./src/game');
const StatTracker = require('./src/stat_tracker');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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

const server = http.createServer(app);
const wss = new ws.Server({ server });

const stats = new StatTracker();
let newGame = new Game(2, 10000, stats);

// stats setup
app.set('stats', stats);

wss.on('connection', (ws, req) => {
    if (newGame.state != "NOT-STARTED") {
        newGame = new Game(2, 10000, stats);
    }
    
    const url = new URL(req.url, 'ws://localhost:8080/');

    newGame.addPlayer(ws, url.searchParams.get('name'));

    if (newGame.full()) {
        newGame.start();
        newGame = new Game(2, 10000, stats);
    }

    ws.on('message', m => ws.game.handleMessage(ws, m));
    ws.on('close', code => ws.game.handleClose(ws, code));
})

server.listen(process.argv[2]);
