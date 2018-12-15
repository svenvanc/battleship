

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
    if (msg.type == "SHOT_RESULT") {
        console.log("SHOT_RESULT");
        showShotResult(msg.ownBoard, msg.x, msg.y, msg.hit);
        if (msg.sunkenShip != null) {
            showSunkenShip(msg.ownBoard, msg.sunkenShip);
        }
    }
}

socket.onopen = function() {
    //zodra ik open ga dan
    console.log('socket onopen')
    socket.send(JSON.stringify({data: "hallo wereld"}));
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

$( document ).ready(function() {
    console.log( "gameReady!" );

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
            html += '<div class="box" x="' + column + '" y="' + row + '" id ="cell_' + row + '-' + column + '"></div>'
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
});

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


