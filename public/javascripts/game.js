

$("#date").html(new Date());

//haal data up
$.get("/data", function(data, status) {
    console.log(data);
    //werk met de data
    $("#date").html(data.data);
    $("#error").html(data.error);
})

$.post("/data", {question: " are you there?"}, function(data, status) {
    console.log(data);
});
//aanmaken
const socket = new WebSocket("ws://localhost:3000");
socket.onmessage = function(event) {
    //als ik een message binnen krijg
    console.log((event));
}
socket.onopen = function() {
    //zodra ik open ga dan
    socket.send(JSON.parse({data: "data"}));
}

function makegrid() {
    console.log("make grid");

    let html = '<div class="gamegrid-container">'
   
    for (let row = 1; row < 11; row++) {
        for (column = 1; column < 11; column++) {
            html += '<div class="box" id ="' + row + '-' + column + '">a</div>'
        }
    }
    html += "</div>"
    $("#gameboard").append(html);
}
