import express from 'express';
import http from 'http';
import socketIO from 'socket.io';
//Get the router
import router from './router';
import utils from './js/utils';
import game from './server/js/game';
// let utils = require('./js/utils');

//Express app
let app = express();
//HTTP servver
let server = http.Server(app);
//Socket server
let io = socketIO.listen(server);

app.use(router);

//Keep track of player ids
server.lastPlayerID = 0;

io.on('connection', (socket) => {
    socket.on('newplayer', () => {
        socket.player = {
            id: server.lastPlayerID,
            x: utils.randomInt(100, 600),
            y: utils.randomInt(100, 600)
        };
        server.lastPlayerID += 1;
        socket.emit('allplayers', getAllPlayers());
        socket.broadcast.emit('newplayer', socket.player);

        socket.on('disconnect', () => {
            io.emit('remove', socket.player.id);
        });
    });
});

let getAllPlayers = () => {
    let players = [];
    Object.keys(io.sockets.connected).forEach((socketID) => {
        let player = io.sockets.connected[socketID].player;
        if (player) {
            players.push(player);
        }
    })
    return players;
}

server.listen(8080, () => {
    console.log("Server listening on " + server.address().port);
    //Initialize the game
    game.init();
    //Start the game loop
    game.update();
});
