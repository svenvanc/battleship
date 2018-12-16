let waitingPlayer = null;
let players = {};

function newPlayer(playerID, ws, locations) {
    thisPlayer = new Player(playerID, ws, locations);
    if (waitingPlayer == null) {
        waitingPlayer = thisPlayer;
        waitingPlayer.sendMessage({type: "WAIT"});
        // waitingPlayer.sendMessage("WAIT");
    } else {
        let game = new Game([waitingPlayer, thisPlayer]);
        players[waitingPlayer.playerID] = game;
        players[thisPlayer.playerID] = game;

        thisPlayer.sendMessage({type: "YOUR_TURN", value: false});
        waitingPlayer.sendMessage({type: "YOUR_TURN", value: true});

        thisPlayer.sendMessage({type: "START"});
        waitingPlayer.sendMessage({type: "START"});

        waitingPlayer = null;
    }
}

function Game(players) {

    board0 = new Board(players[0].locations);
    board1 = new Board(players[1].locations);

    this.shot = function(playerID, x, y) {
        // todo: optimize this code
        let result = null;
        let nextPlayerID = null;
        let victory = false;
        if (playerID == players[0].playerID) {
            result = board1.shot(x, y);
            nextPlayerID = (result.hit) ? playerID : players[1].playerID;
            victory = board1.allShipsSunken();
        }
        if (playerID == players[1].playerID) {
            result = board0.shot(x, y);
            nextPlayerID = (result.hit) ? playerID : players[0].playerID;
            victory = board0.allShipsSunken()
        }



        for (player of players) {
            let ownBoard = (player.playerID == playerID);
            let yourTurn = (player.playerID == nextPlayerID);
            player.sendMessage({type: 'SHOT_RESULT', ownBoard, x, y, ...result});
            player.sendMessage({type: 'YOUR_TURN', value: yourTurn});
            if (victory) {
                let playervictory = (player.playerID == playerID);
                player.sendMessage({type: 'VICTORY' , value: playervictory})
            }
        } 
    }
}


function Board(locations) {

    this.cells = [];
    this.ships = [];
    for (let row = 0; row < 10; row++) {
        this.cells[row] = []
        for (column = 0; column < 10; column++) {
            this.cells[row][column] = new Cell();
        }
    }

    for (let i = 0; i < locations.length; i++) {
        const location = locations[i];
        const x = location.x;
        const y = location.y;
        const ship = new Ship(x, y, location.ship.size, location.orientation);
        this.ships.push(ship);
        for (let shipCell = 0; shipCell < location.ship.size; shipCell++) {
            let deltaY = (location.orientation == "V") ? shipCell: 0;
            let deltaX = (location.orientation == "H") ? shipCell: 0;
            const cell = this.cells[x + deltaX][y + deltaY];
            cell.ship = ship;
            ship.addCell(cell);
        }
    }

    this.shot = function(x, y) {
        return this.cells[x][y].hit();        
    }

    this.allShipsSunken = function() {
        for (let a = 0; a < this.ships.length; a++) {
            if (!this.ships[a].isSunk()) {
                return false;
            }
        }
        return true;
    }
}

/**
 * a Cell of the board
 */
function Cell() {
    this.shot = false;
    this.ship = null;

    /**
     * returns:
     * true/false and optianal a ship with its coordinates and orientation when this ship has been sunk by this shot
     */
    this.hit = function() {
        this.shot = true;
        let hit = false;
        let sunkenShip = null;
        if (this.ship != null) {
            hit = true;
            sunkenShip = (this.ship.isSunk()) ? this.ship.getCoordinates() : null;
        }
        
        return {hit: hit, sunkenShip: sunkenShip};
    }
}


function Ship(x, y, size, orientation) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.orientation = orientation;
    this.shipCells = []
    this.addCell = function(cell) {
        this.shipCells.push(cell);
    }

    this.isSunk = function() {
        let isSunk = true;
        for (let i = 0; i < this.shipCells.length; i++) {
            if (!this.shipCells[i].shot) {
                isSunk = false;
            }
        }
        return isSunk        
    }

    this.getCoordinates = function() {
        return {x: this.x, y: this.y, size: this.size, orientation: this.orientation}
    }
}

function Player(playerID, ws, locations) {
    this.playerID = playerID;
    this.ws = ws;
    this.locations = locations;

    this.sendMessage = function(msg) {
        try {
            this.ws.send(JSON.stringify(msg));
        } catch(e) {
            console.log("send failed", e);
            // todo: implement error handling
        }        
    }
}


function shot(playerID, x, y) {
    let game = players[playerID]
    
    if (game == undefined) {
        console.log("unknown player"); 
        return;
        // todo: implement error handling
    }
    game.shot(playerID, x, y)
}

module.exports = {
    newPlayer, shot
}
