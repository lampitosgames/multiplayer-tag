
let e = {
    //GAME STATES
    GAME_WAITING_FOR_PLAYERS: 2000,
    GAME_STARTING_SOON: 2001,
    GAME_PLAYING: 2002,
    GAME_OVER: 2003,
    GAME_RESETTING: 2004
}

let game = {
    lastPlayerID: 0,
    gameState: e.GAME_WAITING_FOR_PLAYERS,
    players: {}
};

let score = {
    attackingPlayerID: undefined,
    lastAttacker: undefined,
    winner: undefined,
    immunityLength: 3,
    gameLength: 180,
    endscreenLength: 10,
    startCountdownLength: 15,
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
    platforms: [],
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

let _state = {
    e: e,
    game: game,
    score: score,
    physics: physics,
    time: time
};

module.exports = _state;
