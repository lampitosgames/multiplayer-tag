"use strict";

//The socket module handles most communication with the server
app.socket = (function() {
    let a = app;
    let s, sg, sp, st;

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
            a.time.startClientTimer(data.id, data.time);
            sg.players[data.id].setData(data);
        });
        //Listen for players leaving
        socket.on('removePlayer', function(id) {
            delete sp.gameObjects[sg.players[id].gameObject.id];
            delete st.clientTimers[sg.players[id]];
            delete sg.players[id];
        });


        /*
        These events fire the first time the client connects to the server to inform the client of
        current game state
        */
        socket.on('setClientID', function(id) {
            sg.clientID = id;
        });

        socket.on('allPlayers', function(data) {
            for (const id in data) {
                if (!sg.players[id]) {
                    sg.players[id] = new a.p.Player(data[id].id, data[id].x, data[id].y);
                }
                if (sg.clientID != id) {
                    sg.players[id].setData(data[id]);
                } else if (!s.player.shouldUpdateServer) {
                    sg.players[id].setData(data[id]);
                }
            }
        });
    }

    /**
     * Called by the client to update the server (and everyone else) of changes
     */
    function updateClientPlayer() {
        let playerData = sg.players[sg.clientID].getData();
        playerData.time = st.clientTimers[sg.clientID];

        socket.emit('updatePlayer', playerData);
    }

    /**
     * Called by the client to add themself to the player list
     * TODO: Add room ids and seperate games
     */
    function addNewPlayer() {
        socket.emit('createNewPlayer');
    }

    return {
        init: init,
        updateClientPlayer: updateClientPlayer,
        addNewPlayer: addNewPlayer,
        socket: socket
    }
}());
