/*
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

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
*/

const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const battleship = require("./battleship");


const port = 3000;
const app = express();
app.set('view engine', 'ejs')
const indexRouter = require("./routes/index.js");
const gameRouter = require("./routes/gameRouter.js");

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json())

app.use("/", indexRouter);
app.use("/test", gameRouter);


const server = http.createServer(app);

/**
 * web socket
 */
//import
const websocket = require("ws");
//maak de websocket aan
const wss = new websocket.Server({server});
let connectionCounter = 0;
wss.on("connection", function(ws) {

 

  let playerID = 'player_' + connectionCounter++;

  ws.on("message", (message) => {
    console.log("message: " + message, "connection", playerID);
    const msg = JSON.parse(message);
    if (msg.type == "newPlayer") {
      battleship.newPlayer(playerID, ws, msg.locations);      
    }
    if (msg.type == "shot") {
      battleship.shot(playerID, msg.x, msg.y)
    }

    // const data = {
    //   sender: "server",
    //   message: "thank you for: " + message,
    //   error: false,
    // };
    // ws.send(JSON.stringify(data));
  });

  // const intervalId = setInterval(() => {
  //   const data = {
  //     sender: "server",
  //     message: "Are you still there / " + playerID,
  //     error: false,
  //   };
  //   console.log('send ping to', playerID);
  //   ws.send(JSON.stringify(data));
  // }, 5000);

  ws.on("close", () => {
    console.log('CLOSE');
    //clearInterval(intervalId);
  });
});


server.listen(port);