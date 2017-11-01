
let game = {
    lastPlayerID: 0,
    //Game Unit.  32 pixels
    gu: 32,
    players: {}
};

let physics = {
    lastGameObjectID: 0,
    lastPlatformID: 0,
    gravity: 0,
    platforms: [],
    gameObjects: {}
}

let _state = {
    game: game,
    physics: physics
};

module.exports = _state;
