"use strict";

app.socket = (function() {
    let a = app;
    let s, sg;

    let socket = undefined;

    function init() {
        s = a.state;
        sg = s.game;

        socket = io.connect();

        socket.on('newplayer', function(data) {
            sg.players[data.id] = {
                id: data.id,
                x: data.x,
                y: data.y
            };
        });

        socket.on('allplayers', function(data) {
            for (let i=0; i<data.length; i++) {
                sg.players[data[i].id] = {
                    id: data[i].id,
                    x: data[i].x,
                    y: data[i].y
                };
            }
        });

        socket.on('remove', function(id) {
            delete sg.players[id];
        });
    }

    function addNewPlayer() {
        socket.emit('newplayer');
    }

    return {
        init: init,
        addNewPlayer: addNewPlayer,
        socket: socket
    }
}());
