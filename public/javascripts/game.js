'use strict'

const socket = new WebSocket("ws://" + location.host);
socket.onmessage = function(event) {
  
    let msg = JSON.parse(event.data);
    if (msg.type == "WAIT") {
        console.log("player is waiting");
        showMessage("waiting for other player");
    }
    if (msg.type == "START") {
        console.log("game has started");
        showMessage("started");
    }

    if (msg.type == "YOUR_TURN") {
        enableTurn(msg.value);
    }

    if (msg.type == "VICTORY") {
        showVictory(msg.value);
        console.log(msg.type, msg.value);
    }

    if (msg.type == "SHOT_RESULT") {
        console.log("SHOT_RESULT");
        showShotResult(msg.ownBoard, msg.x, msg.y, msg.hit);
        if (msg.sunkenShip != null) {
            showSunkenShip(msg.ownBoard, msg.sunkenShip);
        }
    }
}


socket.onopen = function() {
    socket.send(JSON.stringify({data: "hi there"}));
};

function showShotResult(ownBoard, x, y, shotResult) {
    let boardId = (ownBoard) ? '#gameboard2' : '#gameboard1';
    let cellId = '#cell_' + y + '-' + x;
    let cellContent = (shotResult) ? 'X' : 'o';
    let cell = boardId + ' ' + cellId;
    $(cell).text(cellContent);

    if (shotResult) {
        $(cell).addClass('box-hit');
    }
}

/**
 * Mark a ship that is sunken.
 * @param {*} ownBoard has value true or false
 * @param {*} sunkenShip object, for example {"x":3,"y":3,"size":3,"orientation":"V"}
 */
function showSunkenShip(ownBoard, sunkenShip) {
    let boardId = (ownBoard) ? '#gameboard2' : '#gameboard1';
    addClassToShip(boardId, sunkenShip.size, sunkenShip.orientation, sunkenShip.x, sunkenShip.y, "box-sunken");
}

function showMessage(message) {
    $("#message").text(message);
}

function enableTurn(enable) {
    if (enable) {
        $("#glass2").hide();
    } else {
        $("#glass2").show();
    }
}

function showVictory(victory) {
    $("#glass2").show();
    let msg = (victory) ? "VICTORY" : "DEFEAT"
    $("#glass2 .msg").text(msg);
}


$( document ).ready(function() {

    $( "#homeButton" ).click(function() {
        window.location.href = "/";
    });

    $( "#playButton" ).click(function() {
        $( "#playButton").attr("disabled", true);
        socket.send(JSON.stringify({type: "newPlayer", locations: locations}));
    });

    let html = '<div class="gamegrid-container">';
   
    for (let row = 0; row < 10; row++) {
        for (let column = 0; column < 10; column++) {
            html += '<div class="box" x="' + column + '" y="' + row + '" id ="cell_' + row + '-' + column + '">&nbsp;</div>'
        }
    }
    html += "</div>";
    $("#gameboard1").append(html);
    $("#gameboard2").append(html);

    $( "#gameboard2 .box" ).click(function(event) {
        const x = $(this).attr('x');
        const y = $(this).attr('y');
        socket.send(JSON.stringify({type: "shot", x: x, y: y}));
    });

    let locations = generateLocations();
    drawShips(locations);
});


function generateLocations() {
    let locations = [];

    // easy for testing
    // let ship = new Ship(1);
    // let location = new Location(0, 0, ship, "V");
    // locations.push(location)
    // return locations;

    const shipSizes = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
    for (let i = 0; i < shipSizes.length; i++) {
        let location;
        let correctLocation;
        let ship = new Ship(shipSizes[i]);
        do {
            let c = generateRandomShipLocation();
            location = new Location(c.x, c.y, ship, c.orientation);

            correctLocation =
                doesLocationFitTheBoard(location) &&
                doesLocationKeepDistanceFromOtherLocations(location, locations);
        }
        while (!correctLocation);
        locations.push(location);
    }
    return locations;
}

function generateRandomShipLocation() {
    let x = Math.floor(Math.random() * 10);
    let y = Math.floor(Math.random() * 10);
    let orientation = (Math.random() < 0.5) ? 'H' : 'V';
    return { x, y, orientation }
}


function doesLocationFitTheBoard(location) {
    let finalPosition = getXYforNthPosition(location, location.ship.size - 1);
    return (
        finalPosition.x <= 9 &&
        finalPosition.y <= 9
    )
}


function doesLocationKeepDistanceFromOtherLocations(location, locations) {

    for (let i = 0; i < locations.length; i++) {
        let location2 = locations[i];
        if (calculateMinSquaredDistance(location, location2) <= 2) {
            return false;
        }
    }
    return true;
}

/**
 * calculate the minimum squared distance between the points of a ship
 * @param {*} location1 
 * @param {*} location2 
 */
function calculateMinSquaredDistance(location1, location2) {
    let minSquaredDistance = 100;
    for (let i = 0; i < location1.ship.size; i++) {
        let coordinates1 = getXYforNthPosition(location1, i);

        for (let j = 0; j < location2.ship.size; j++) {
            let coordinates2 = getXYforNthPosition(location2, j);
            let squaredDistance = (coordinates1.x - coordinates2.x)**2 + (coordinates1.y - coordinates2.y)**2;
            if (squaredDistance < minSquaredDistance) {
                minSquaredDistance = squaredDistance;
            }
        }
    }
    return minSquaredDistance;
}

function getXYforNthPosition(location, i) {
    let deltaX = (location.orientation === "H") ? i : 0;
    let deltaY = (location.orientation === "V") ? i : 0;
    let x = location.x + deltaX;
    let y = location.y + deltaY;
    return { x, y };
}


function drawShips(locations) {
    for (let count = 0; count < locations.length; count++) {
        let location = locations[count]
        addClassToShip("#gameboard1", location.ship.size, location.orientation, location.x, location.y, "ship");
    }
}

function addClassToShip(board, size, orientation, x, y, cssClass) {
    for (let shipCell = 0; shipCell < size; shipCell++) {
        let deltaX = (orientation == "H") ? shipCell : 0;
        let deltaY = (orientation == "V") ? shipCell : 0;
        let cell = $(board + " #cell_" + (y + deltaY) + "-" + (x + deltaX));
        cell.addClass(cssClass);
    }
}

function Ship(size) {
    this.size = size;
}

function Location(x, y, ship, orientation) {
    this.x = x;
    this.y = y;
    this.ship = ship;
    this.orientation =  orientation;
}
