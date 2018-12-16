

// $("#date").html(new Date());

// //haal data up
// $.get("/data", function(data, status) {
//     console.log(data);
//     //werk met de data
//     $("#date").html(data.data);
//     $("#error").html(data.error);
// })

// $.post("/data", {question: " are you there?"}, function(data, status) {
//     console.log(data);
// });
//aanmaken
// const socket = new WebSocket("ws://localhost:3000");
const socket = new WebSocket("ws://" + location.host);
console.log(location);
socket.onmessage = function(event) {
    //als ik een message binnen krijg
    console.log('onmessage, event=', event);
    msg = JSON.parse(event.data);
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

    if (msg.type == "SHOT_RESULT") {
        console.log("SHOT_RESULT");
        showShotResult(msg.ownBoard, msg.x, msg.y, msg.hit);
        if (msg.sunkenShip != null) {
            showSunkenShip(msg.ownBoard, msg.sunkenShip);
        }
    }
}


socket.onopen = function() {
    console.log('socket onopen')
    socket.send(JSON.stringify({data: "hi there"}));
}

function showShotResult(ownBoard, x, y, shotResult) {
    let boardId = (ownBoard) ? '#gameboard2' : '#gameboard1';
    let cellId = '#cell_' + y + '-' + x;
    let cellContent = (shotResult) ? 'X' : 'o';
    console.log('show', cellId, cellContent);
    let cell = boardId + ' ' + cellId;
    $(cell).text(cellContent);
    if (shotResult) {
        $(cell).addClass('box-hit');
    }
}

/**
 * {"x":3,"y":3,"size":3,"orientation":"V"}
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


$( document ).ready(function() {

    $( "#homeButton" ).click(function() {
        window.location.href = "/";
    });

    $( "#playButton" ).click(function() {
        $( "#playButton").attr("disabled", true);
        console.log("playing")
        socket.send(JSON.stringify({type: "newPlayer", locations: locations}));
    });

    console.log("make grid");

    let html = '<div class="gamegrid-container">'
   
    for (let row = 0; row < 10; row++) {
        for (column = 0; column < 10; column++) {
            html += '<div class="box" x="' + column + '" y="' + row + '" id ="cell_' + row + '-' + column + '">&nbsp;</div>'
        }
    }
    html += "</div>"
    $("#gameboard1").append(html);
    $("#gameboard2").append(html);

    $( "#gameboard2 .box" ).click(function(event) {
        const x = $(this).attr('x');
        const y = $(this).attr('y');
        console.log(x, y);
        socket.send(JSON.stringify({type: "shot", x: x, y: y}));
    });

    let locations = []
    let ship = new Ship(4);
    let location = new Location(1, 1);
    location.placeShip(ship, "H");
    locations.push(location)

    ship = new Ship(3);
    location = new Location(3, 3);
    location.placeShip(ship, "V");
    locations.push(location)
    
    drawShips(locations)
    let minDistance = calculateMinSquaredDistance(locations[0], locations[1]);
    console.log(minDistance);
});


/**
 * calculate the minimum squared distance between the points of a ship
 * @param {*} location1 
 * @param {*} location2 
 */
function calculateMinSquaredDistance(location1, location2) {
    minSquaredDistance = 100;
    for (let i = 0; i < location1.ship.size; i++) {
        let { x: x1, y: y1 } = getXYforNthPosition(location1, i);

        for (let j = 0; j < location2.ship.size; j++) {
            let { x: x2, y: y2 } = getXYforNthPosition(location2, j);
            squaredDistance = (x1 - x2)**2 + (y1 - y2)**2;
            if (squaredDistance < minSquaredDistance) {
                minSquaredDistance = squaredDistance;
            }
        }
    }
    return minSquaredDistance;
}

function getXYforNthPosition(location, i) {
    let deltaX = (location.orientation == "V") ? i : 0;
    let deltaY = (location.orientation == "H") ? i : 0;
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
        let deltaX = (orientation == "V") ? shipCell : 0;
        let deltaY = (orientation == "H") ? shipCell : 0;
        let cell = $(board + " #cell_" + (x + deltaX) + "-" + (y + deltaY));
        console.log(cell);
        cell.addClass(cssClass);
    }
}

function Ship(size) {
    this.size = size;
}

function Location(x, y) {
    this.x = x;
    this.y = y;
    this.placeShip = function(ship, orientation) {
        this.ship = ship;
        this.orientation =  orientation;
    }
}


