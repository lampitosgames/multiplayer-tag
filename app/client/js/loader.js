"use strict";

//Init global app
let app = {};

window.onload = function() {
    //Initialize the mouse so errors don't get thrown
    app.mouse = [0, 0];

    //Initialize modules
    app.time.init();
    app.keys.init();
    app.audio.init();

    //Initialize main
    app.main.init();
}

window.onblur = function() {
    app.main.togglePause(true);
}

window.onfocus = function() {
    app.main.togglePause(false);
}

document.onmousemove = function(e) {
    app.mouse = app.getMouse(e);
}
