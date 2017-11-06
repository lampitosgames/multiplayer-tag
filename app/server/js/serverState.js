
let game = {
    lastPlayerID: 0,
    //Game Unit.  32 pixels
    gu: 38,
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
    platforms: [],
    gameObjects: {}
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
    clientTimers: {}
};

let _state = {
    game: game,
    physics: physics,
    time: time
};

module.exports = _state;
