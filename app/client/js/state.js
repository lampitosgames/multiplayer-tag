"use strict";

//The state module contains state for all other modules, providing easy data access and modification from anywhere in the app
app.state = (function() {
    let a = app;

    //Enum values for all the state.  Keys must be unique
    let e = {
        //GAME STATES
        START_SCREEN: 1000,
        CONNECTING: 1001,
        PLAYING: 1002,
    };

    //Main module state
    let game = {
        //ID of the animation being used
        animationID: 0,
        players: {}
    };

    //Time module state
    let time = {
        //Delta time
        dt: 0,
        //Total time the app has been running
        runTime: 0,
        //Timestamp of the last update loop
        lastTime: 0,
        //Current frames per second
        fps: 0
    };

    //Expose all state variables to the app
    return {
        e: e,
        game: game,
        time: time
    };
}());
