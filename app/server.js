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

//Hook in the app router
app.use(router);

//On a new player connection
io.on('connection', (socket) => {
    //Bind createNewPlayer for when the cleint requests a player
    socket.on('createNewPlayer', () => {
        //Add a new player to the game and store the ID on this socket
        socket.playerID = game.addNewPlayer(socket);

        //Listen to player updates from the client
        socket.on('updatePlayer', (data) => {
            game.updatePlayerFromClient(socket, data);
        });

        //Only bind disconnect if the player was created in the first place
        //Disconnect the player
        socket.on('disconnect', () => {
            game.disconnectPlayer(socket.playerID);
        });
    });
});

//Start a server on port 8000
server.listen(8000, () => {
    console.log("Server listening on " + server.address().port);
    //Initialize the game
    game.init(io);
    //Start the game loop
    game.update();
});
