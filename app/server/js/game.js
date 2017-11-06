//Import server-side state
import state from './serverState';
//Import modules
import time from '../../js/time';
import utils from '../../js/utils';
import p from '../../js/player';
import physics from '../../js/physics/physics';
import physObj from '../../js/physics/physicsObjects';

//Script globals
let io;
let players;
let sp, st;

/**
 * Used to initialize the game.  It initializes other modules and gets shorthand variables
 */
let init = (_io) => {
    utils.init();
    time.init();
    p.init();
    physics.init();
    physObj.init();
    io = _io;

    //Store a shorthand reference to the players array
    players = state.game.players;
    sp = state.physics;
    st = state.time;

    physics.start();
}

/**
 * The game update loop
 * Runs at 60fps on the server
 */
let updateGame = () => {
    //Set timeout to self-call this function at 60FPS
    setTimeout(updateGame, (1000 / 60));
    //Update other modules
    time.update();
    physics.update();

    //Update all players
    for (const id in players) {
        players[id].update();
    }
}

let updateNetwork = () => {
    setTimeout(updateNetwork, (1000 / 30));

    let playerData = {};
    for (const i in players) {
        let curData = playerData[players[i].id] = players[i].getData();
        curData.serverTime = st.clientTimers[players[i].id];
    }
    //Emit the full player list to the new client
    io.emit('allPlayers', playerData);
}

/**
 * This function will update the server's version of a specific player's data from
 * their game client.
 * Then that data gets broadcast to all other clients.
 */
let updatePlayerFromClient = (socket, data) => {

    players[data.id].setData(data);
}

/**
 * Creates and adds a new player to the game.
 * Sends the new client current data on the game state, and sends all other clients the
 * new player.
 */
let addNewPlayer = (socket) => {
    //Create an ID for this player
    let id = state.game.lastPlayerID++;

    //Create a new player object and store it in the array
    players[id] = new p.Player(id, utils.randomInt(0, 10), utils.randomInt(0, 10));
    players[id].gameObject.hasGravity = true;
    time.startClientTimer(id, 0);

    //Emit the new player's id to their client
    socket.emit('setClientID', id);

    //Add server time to the response
    let newPlayerData = players[id].getData();
    newPlayerData.time = st.clientTimers[id];
    //Emit the new player to all connected clients
    io.emit('newPlayer', newPlayerData);

    //Return the new player's ID
    return id;
}

/**
 * Function to disconnect a player from the server
 */
let disconnectPlayer = (id) => {
    //Remove the player's Game Object
    delete sp.gameObjects[players[id].gameObject.id];
    //Remove the player's Timers
    delete st.clientTimers[id];
    //Remove the player's data in the player array
    delete players[id];
    //Emit that a player disconnected
    io.emit('removePlayer', id);
}

//Export everything
let _game = {
    init,
    updateGame,
    updateNetwork,
    updatePlayerFromClient,
    addNewPlayer,
    disconnectPlayer
}

export default _game;
