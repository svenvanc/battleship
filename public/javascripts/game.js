

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
const socket = new WebSocket("ws://localhost:3000");
socket.onmessage = function(event) {
    //als ik een message binnen krijg
    console.log('onmessage, event=', event);
}
socket.onopen = function() {
    //zodra ik open ga dan
    console.log('socket onopen')
    socket.send(JSON.stringify({data: "hallo wereld"}));
}


$( document ).ready(function() {
    console.log( "gameReady!" );

    $( "#homeButton" ).click(function() {
        window.location.href = "/";
    });

    $( "#playButton" ).click(function() {
        $( "#playButton").attr("disabled", true);
        console.log("playing")
    });

    console.log("make grid");

    let html = '<div class="gamegrid-container">'
   
    for (let row = 1; row < 11; row++) {
        for (column = 1; column < 11; column++) {
            html += '<div class="box" id ="cell_' + row + '-' + column + '">a</div>'
        }
    }
    html += "</div>"
    $("#gameboard1").append(html);
    $("#gameboard2").append(html);

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
        console.table(location)
        

        for (let shipCell = 0; shipCell < location.ship.size; shipCell++) {
            let deltaX = (location.orientation == "V") ? shipCell: 0;
            let deltaY = (location.orientation == "H") ? shipCell: 0;
            let cell = $("#cell_" + (location.x + deltaX) + "-" + (location.y + deltaY));
            console.log(cell);
            cell.addClass("ship");
        }
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
