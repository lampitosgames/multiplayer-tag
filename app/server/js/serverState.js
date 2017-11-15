"use strict";

//Game enums
let e = {
    //GAME STATES
    GAME_WAITING_FOR_PLAYERS: 2000,
    GAME_STARTING_SOON: 2001,
    GAME_PLAYING: 2002,
    GAME_OVER: 2003,
    GAME_RESETTING: 2004
}

//Game state
let game = {
    //Last player to connect.  Every client gets a unique player ID
    lastPlayerID: 0,
    //Track the game state
    gameState: e.GAME_WAITING_FOR_PLAYERS,
    //Store all player objects
    players: {}
};

//Score state
let score = {
    //Which player is attacking
    attackingPlayerID: undefined,
    //Who was the last player to be attacking
    lastAttacker: undefined,
    //Who won the game
    winner: undefined,
    //How long is the immunity timer
    immunityLength: 3,
    //How long is a game
    gameLength: 180,
    //How long does the game over screen last before a new game begins
    endscreenLength: 10,
    //How long does the game wait before starting
    startCountdownLength: 15
};

//Physics state
let physics = {
    //Game object unique ID tracker
    lastGameObjectID: 0,
    //Platform unique ID tracker
    lastPlatformID: 0,
    //Physics globals (see physics.js for more info)
    speedLimit: 0,
    jumpHeight: 0,
    jumpTime: 0,
    gravity: undefined,
    jumpVel: undefined,
    moveSpeed: undefined,
    sprintMult: undefined,
    //Array of platforms
    platforms: [],
    //Game Objects
    gameObjects: {}
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
    clientTimers: {},
    //General timers with unique ids
    timers: {}
};

//Export the state
let _state = {
    e: e,
    game: game,
    score: score,
    physics: physics,
    time: time
};

module.exports = _state;
