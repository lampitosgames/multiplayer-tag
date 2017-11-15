"use strict";

/**
 * Client-side module that handles socket communication with the server
 */
app.socket = (function() {
    let a = app;
    let s,
        sg,
        sp,
        st;

    //A reference to the client's socket
    let socket = undefined;

    /**
     * Initialize the socket module and bind the socket to server events
     */
    function init() {
        //Get shorthand state
        s = a.state;
        sg = s.game;
        sp = s.physics;
        st = s.time;

        //Connect and get a new socket
        socket = io.connect();

        //Listen for new players
        socket.on('newPlayer', function(data) {
            //Add the new player to the list
            sg.players[data.id] = new a.p.Player(data.id, data.x, data.y);
            //Start a client timer for that player
            a.time.startClientTimer(data.id, data.time);
            //Set that player's data in the game state
            sg.players[data.id].setData(data);
        });

        //Listen for players leaving
        socket.on('removePlayer', function(id) {
            //Remove that player from the state
            delete sp.gameObjects[sg.players[id].gameObject.id];
            delete st.clientTimers[sg.players[id]];
            delete sg.players[id];
        });

        //Listen for new attackers
        socket.on('newAttacker', function(newAttacker) {
            //Store the old attacker
            s.score.lastAttacker = s.score.attackingPlayerID;
            //Delete the last declared timer
            delete s.time.timers.clientLastDeclared;
            //Start an immunity timer
            a.time.startNewTimer("lastTaggedImmunity");
            //Set the new attacker
            s.score.attackingPlayerID = newAttacker;
            //Play the new attacker sound
            s.audio.sounds["playerTagged.wav"].start();
        });

        //Listen for game state changes
        socket.on("updateGameState", function(newState) {
            //Update things based on server-authoritative state
            s.game.gameState = newState.gameState;
            s.score.winner = newState.winnerID;
            s.time.timers.gameStartTimer = newState.gameStartTimer;
            s.time.timers.gameTimer = newState.gameTimer;
            s.time.timers.gameOverTimer = newState.gameOverTimer;
        });

        //Resets the game when the server detects a reset game state
        socket.on('resetGame', function(data) {
            //Reset client-specific game state to the defaults
            s.score.lastBuzzerSecond = 16;
            s.score.playedGameEndSound = false;
            s.game.state = s.e.GAME_WAITING_FOR_PLAYERS;
        });

        //Listen for the server sending this client its ID
        socket.on('setClientID', function(id) {
            //Set our id
            sg.clientID = id;
            //Set the game state to playing now that the connection has been established
            sg.clientState = s.e.PLAYING;
        });

        //Listen for updates to all players.  This is sent out by the server at 30fps
        socket.on('allPlayers', function(data) {
            //Loop through every player in the data
            for (const id in data) {
                //If a player sent by the server doesn't exist on the client
                if (!sg.players[id]) {
                    //Create that player
                    sg.players[id] = new a.p.Player(data[id].id, data[id].x, data[id].y);
                }
                //If the player is not the client player
                if (sg.clientID != id) {
                    //Set the data
                    sg.players[id].setData(data[id]);
                    //Else, the player is the client player
                } else {
                    //Set data but remain client-authoritative
                    sg.players[id].setClientData(data[id]);
                }
            }
        });
    }

    /**
     * Called by the client to update the server (and everyone else) of changes
     */
    function updateClientPlayer() {
        //Get the client player data
        let playerData = sg.players[sg.clientID].getData();
        //Grab the client's time
        playerData.time = st.clientTimers[sg.clientID];
        //Emit an update
        socket.emit('updatePlayer', playerData);
    }

    /**
     * Called if the client is attacking and they tag someone.
     * Pass the tagged player's id to the server
     */
    function declareNewAttacker(id) {
        socket.emit('tagPlayer', id);
    }

    /**
     * Called by the client to add themself to the player list
     */
    function addNewPlayer() {
        socket.emit('createNewPlayer');
    }

    //Export everything
    return {init: init, updateClientPlayer: updateClientPlayer, addNewPlayer: addNewPlayer, declareNewAttacker: declareNewAttacker, socket: socket}
}());
