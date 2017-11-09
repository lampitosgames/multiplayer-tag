"use strict";

//The state module contains state for all other modules, providing easy data access and modification from anywhere in the app
app.state = (function() {
    let a = app;

    //Enum values for all the state.  Keys must be unique
    let e = {
        //GAME STATES
        LOADING: 1000,
        TUTORIAL_SCREEN: 1001,
        START_SCREEN: 1002,
        CONNECTING: 1003,
        PLAYING: 1004,
        GAME_OVER: 1005
    };

    //Main module state
    let game = {
        //ID of the animation being used
        animationID: 0,
        //Game state.  LOADING by default
        state: e.LOADING,
        //Game Unit.  32 pixels
        gu: 30,
        //Player ID of the client
        clientID: undefined,
        //Holds all player data
        players: {},
        //An array of promises.  Once they all resolve, all assets have loaded
        loading: []
    };

    let score = {
        attackingPlayerID: undefined,
        lastAttacker: undefined,
        immunityLength: 3
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

    let image = {
        spritesheetNames: [
            "core_spritesheet",
            "winter_spritesheet"
        ],
        backgroundNames: [
            "bg_grasslands.png",
        ],
        sheets: {},
        backgrounds: {}
    }

    let view = {
        active: undefined,
        viewScale: 50
    }

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
        clientTimers: {},
        //General timers with unique ids
        timers: {}
    };

    //Expose all state variables to the app
    return {
        e: e,
        game: game,
        score: score,
        physics: physics,
        player: player,
        image: image,
        view: view,
        time: time
    };
}());
