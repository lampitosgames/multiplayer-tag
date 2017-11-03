"use strict";

//Init global app
let app = {};

window.onload = function() {
    //Initialize the mouse so errors don't get thrown
    app.mouse = [0, 0];

    //Initialize modules
    app.keys.init();
    app.utils.init();
    app.time.init();
    app.socket.init();
    app.p.init();
    app.physics.init();
    app.physObj.init();
    app.playerUpdates.init();

    //Initialize main
    app.game.init();

    //Start the game
    app.game.start();
}

window.onblur = function() {
    // app.main.togglePause(true);
}

window.onfocus = function() {
    // app.main.togglePause(false);
}

/**
 * Get a cross-browser viewport object with related size data
 */
app.getViewport = function() {
    var ele = window,
        pre = 'inner';
    if (!('innerWidth' in window)) {
        pre = 'client';
        ele = document.documentElement || document.body;
    }
    //Width of window
    return {
        width: ele[pre + 'Width'],
        //Height of window
        height: ele[pre + 'Height'],
        //View width css unit
        vw: ele[pre + 'Width'] / 100.0,
        //View Height css unit
        vh: ele[pre + 'Height'] / 100.0
    };
}
