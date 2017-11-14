"use strict";

//Init global app
let app = {};

window.onload = function() {
    //Initialize the mouse so errors don't get thrown
    // app.mouse = [0, 0];

    //Initialize modules
    app.keys.init();
    app.utils.init();
    app.time.init();
    app.image.init();
    app.socket.init();
    app.p.init();
    app.physics.init();
    app.physObj.init();
    app.playerUpdates.init();
    app.levelLoader.init();
    app.view.init();
    app.particle.init();
    app.audio.init();

    //Initialize main
    app.game.init();

    //Start the game
    app.game.start();

    //Store the total number of loading objects
    app.state.game.numAssetsLoading = app.state.game.loading.length;

    //Wait for all asset loading promises to resolve, removing each as it does
    for (let p=0; p<app.state.game.loading.length; p++) {
        app.state.game.loading[p].then(function() {
            //delete the promise from the list
            let index = app.state.game.loading.indexOf(this);
            app.state.game.loading.splice(index, 1);
        });
    }
}

window.onblur = function() {
    if (app.state.game.state == app.state.e.PLAYING) {
        app.state.game.state = app.state.e.PAUSED;
    }
}

window.onfocus = function() {
    if (app.state.game.state == app.state.e.PAUSED) {
        app.state.game.state = app.state.e.PLAYING;
    }
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
