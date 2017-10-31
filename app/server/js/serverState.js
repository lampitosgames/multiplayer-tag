
let game = {
    lastPlayerID: 0,
    //Game Unit.  32 pixels
    gu: 32,
    players: {}
};

let physics = {
    lastRigidBodyID: 0,
    gravity: 0,
    rigidBodies: []
}

let _state = {
    game: game,
    physics: physics
};

module.exports = _state;
