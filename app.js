const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const battleship = require("./battleship");


const port = 3000;
const app = express();
app.set('view engine', 'ejs')
const indexRouter = require("./routes/index.js");

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json())

app.use("/", indexRouter);


const server = http.createServer(app);

const websocket = require("ws");
const wss = new websocket.Server({server});
let connectionCounter = 0;
wss.on("connection", function(ws) {

 

  let playerID = 'player_' + connectionCounter++;

  ws.on("message", (message) => {
    const msg = JSON.parse(message);
    if (msg.type == "newPlayer") {
      battleship.newPlayer(playerID, ws, msg.locations);      
    }
    if (msg.type == "shot") {
      battleship.shot(playerID, msg.x, msg.y)
    }
  });

  ws.on("close", () => {
    console.log('CLOSE');
    // todo: implement: game aborted, send message to remaining player
  });
});


server.listen(port);
