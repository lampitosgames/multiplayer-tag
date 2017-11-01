
let game = {
    lastPlayerID: 0,
    //Game Unit.  32 pixels
    gu: 32,
    players: {}
};

let physics = {
    lastGameObjectID: 0,
    lastPlatformID: 0,
    jumpHeight: 0,
    jumpTime: 0,
    gravity: undefined,
    jumpVel: undefined,
    platforms: [],
    gameObjects: {}
}

let _state = {
    game: game,
    physics: physics
};

module.exports = _state;
