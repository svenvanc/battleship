let waitingPlayer = null;
let players = {};

function newPlayer(playerID, ws) {
    console.log("newPlayer.test", playerID);
    thisPlayer = new Player(playerID, ws);
    if (waitingPlayer == null) {
        waitingPlayer = thisPlayer;
        waitingPlayer.sendMessage("WAIT");
    } else {
        let game = new Game([waitingPlayer, thisPlayer]);
        players[waitingPlayer.playerID] = game;
        players[thisPlayer.playerID] = game;
        thisPlayer.sendMessage("START");
        waitingPlayer.sendMessage("START");
        waitingPlayer = null;
    }
    console.log('current players', players)
}

function Game(players) {
    board0 = new Board();
    board1 = new Board();

    this.shot = function(playerID, x, y) {
        console.log(playerID, x, y);
        if (playerID == players[0].playerID) {
            console.log("shot on player 2");
        }
        if (playerID == players[1].playerID) {
            console.log("shot on player 1");
        }
    }
}

function Board() {
    this.shot = function(playerID, x, y) {
        console.log(playerID, x, y);
    }
}

function Player(playerID, ws) {
    this.playerID = playerID;
    this.ws = ws;

    this.sendMessage = function(msg) {
        console.log('SEND msg', playerID, msg)
        try {
            this.ws.send(msg);
        } catch(e) {
            console.log("send failed", e);
        }        
    }
}


function shot(playerID, x, y) {
    console.log("shot.test", playerID, x, y);
    let game = players[playerID]
    
    if (game == undefined) {
        console.log("unknown player"); 
        return
    }
    game.shot(playerID, x, y)
}



module.exports = {
    newPlayer, shot
}
