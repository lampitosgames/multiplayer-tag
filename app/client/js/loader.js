"use strict";

//Init global app
let app = {};

//When all scripts load, initialize the app
window.onload = function() {
    //Initialize all modules in no particular order
    app.keys.init();
    app.utils.init();
    app.time.init();
    app.image.init();
    app.socket.init();
    app.p.init();
    app.scoring.init();
    app.physics.init();
    app.physObj.init();
    app.playerUpdates.init();
    app.levelLoader.init();
    app.view.init();
    app.particle.init();
    app.audio.init();

    //Initialize the game
    app.game.init();

    //Start the game (this will call start on the modules that need it)
    app.game.start();

    //Store the total number of loading objects
    app.state.game.numAssetsLoading = app.state.game.loading.length;

    //Wait for all asset loading promises to resolve, removing each as it does
    //This is used by the client loading state to draw the load bar
    for (let p=0; p<app.state.game.loading.length; p++) {
        app.state.game.loading[p].then(function() {
            //delete the promise from the list
            let index = app.state.game.loading.indexOf(this);
            app.state.game.loading.splice(index, 1);
        });
    }
}

//When onblur fires, pause the game (if the game is currently playing)
window.onblur = function() {
    if (app.state.game.clientState == app.state.e.PLAYING) {
        app.state.game.clientState = app.state.e.PAUSED;
    }
}

//When onfocus fires, unpause the game (if it was paused)
window.onfocus = function() {
    if (app.state.game.clientState == app.state.e.PAUSED) {
        app.state.game.clientState = app.state.e.PLAYING;
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
