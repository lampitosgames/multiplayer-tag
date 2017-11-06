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
        //Game Unit.  32 pixels
        gu: 32,
        //Player ID of the client
        clientID: undefined,
        //Holds all player data
        players: {}
    };

    let physics = {
        lastGameObjectID: 0,
        lastPlatformID: 0,
        speedLimit: 0,
        jumpHeight: 0,
        jumpTime: 0,
        gravity: undefined,
        jumpVel: undefined,
        moveSpeed: undefined,
        sprintMult: undefined,
        platforms:[],
        gameObjects: {}
    };

    let player = {
        shouldUpdateServer: false,
        moveLeft: false,
        moveRight: false,
        dropDown: false,
        sprint: false,
        shouldJump: false
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
        fps: 0,
        //Timers for individual clients so that syncing can happen properly
        clientTimers: {}
    };

    //Expose all state variables to the app
    return {
        e: e,
        game: game,
        physics: physics,
        player: player,
        time: time
    };
}());
