"use strict";

(function() {
    let physics;
    let io;
    let time;
    let s,
        sp,
        sg;

    //Server or client
    let useNodeJS = false;

    function init(_io = undefined) {
        //Detect server/client and import other modules
        if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
            s = require('../server/js/serverState');
            physics = require('./physics/physics');
            time = require('./time');
            io = _io;
            useNodeJS = true;
        } else {
            s = app.state;
            physics = app.physics;
            time = app.time;
        }

        sg = s.game;
        sp = s.physics;

    }

    function update() {
        //Get the attacker
        let attacker = sg.players[s.score.attackingPlayerID];
        //If there is a new attacker, their ID will go here
        let newAttacker = -1;

        //Loop through all players and check the attecker against them for collision
        for (const id in sg.players) {
            //If attacker doesn't exist, break
            if (attacker == undefined) {
                break;
            }
            //Don't check collision against self
            if (id == s.score.attackingPlayerID) {
                continue;
            }

            //Check AABB
            let m = physics.AABB(attacker.gameObject, sg.players[id].gameObject);
            //If they are not colliding, continue
            if (m.norm.lengthSq() < 1.0) {
                continue;
            }
            //Set the new new attacker
            newAttacker = id;
        }
        /*
         * Client/Server specific code
         */
        if (useNodeJS) {
            serverUpdate(newAttacker);
        } else {
            clientUpdate(newAttacker);
        }
    }

    function serverUpdate(newAttacker) {
        //If there isn't an attacker, attempt to choose one
        if (s.score.attackingPlayerID == undefined) {
            //If there are no players, return
            if (Object.keys(sg.players).length == 0) {
                return;
            }
            //There are players.  Pick a random one
            for (const pID in sg.players) {
                setNewAttacker(pID);
                break;
            }
        }
        //If there is a new attacker
        if (newAttacker != -1) {
            //Set the new attacker
            setNewAttacker(newAttacker);
        }

        switch (sg.gameState) {
            case s.e.GAME_WAITING_FOR_PLAYERS:
                //If enough players have joined, begin the start countdown
                if (Object.keys(sg.players).length > 1) {
                    time.startNewTimer("gameStartTimer");
                    console.log("game starting soon...");
                    sg.gameState = s.e.GAME_STARTING_SOON;
                }
                break;
            case s.e.GAME_STARTING_SOON:
                if (s.time.timers["gameStartTimer"] >= s.score.startCountdownLength) {
                    time.startNewTimer("gameTimer");
                    console.log("game starting");
                    sg.gameState = s.e.GAME_PLAYING;
                }
                break;
            case s.e.GAME_PLAYING:
                //If the number of players ever drops to 1, end the game
                if (Object.keys(sg.players).length < 2) {
                    time.startNewTimer("gameOverTimer");
                    console.log("Game Over");
                    sg.gameState = s.e.GAME_OVER;
                    return;
                }

                //Increment how long the attacker has been attacking
                sg.players[s.score.attackingPlayerID].attackTimer += time.dt();

                //If the game has ended
                if (s.time.timers["gameTimer"] >= s.score.gameLength) {
                    time.startNewTimer("gameOverTimer");
                    console.log("Game Over");
                    sg.gameState = s.e.GAME_OVER;
                    //Declare a winner
                    let winnerID = undefined;
                    let winnerScore = 90000;
                    for (const p in sg.players) {
                        if (sg.players[p].attackTimer < winnerScore) {
                            winnerID = p;
                            winnerScore = sg.players[p].attackTimer;
                        }
                    }
                    //Declare the winner
                    s.score.winner = winnerID;
                }
                break;
            case s.e.GAME_OVER:
                //If the game has been over for a while
                if (s.time.timers["gameOverTimer"] >= s.score.endscreenLength) {
                    sg.gameState = s.e.GAME_RESETTING;
                }
                break;
            case s.e.GAME_RESETTING:
                console.log("reset game");
                sg.gameState = s.e.GAME_WAITING_FOR_PLAYERS;
                //Loop through all players and reset their attack timers to zero
                for (const p in sg.players) {
                    sg.players[p].attackTimer = 0;
                }
                io.emit("resetGame");
                break;
        }
    }

    function clientUpdate(newAttacker) {
        //If the client hasn't loaded yet, do nothing
        if (sg.players[sg.clientID] == undefined) {
            return;
        }
        if (sg.players[sg.clientID].attacking && newAttacker != -1) {
            //If the timer is greater that 250ms, or if it is undefined, send declaration
            if (s.time.timers.clientLastDeclared == undefined || s.time.timers.clientLastDeclared > 0.25) {
                //Send the fact that the client tagged someone to the server.
                //Trust the client here because people will get upset if lag caused them not to tag
                //Don't actually change anything client-side.  That will happen when the server responds
                app.socket.declareNewAttacker(newAttacker);
                //Reset the timer
                time.startNewTimer("clientLastDeclared");
            }
        }
    }

    function setNewAttacker(newAttacker) {
        //If the attacker hasn't changed asynchronously
        if (newAttacker != s.score.attackingPlayerID) {
            //If the last tagged player is the new attacker, do nothing
            if (newAttacker == s.score.lastPlayerID && s.time.timers.lastTaggedImmunity < s.score.immunityLength) {
                return;
            }
            time.startNewTimer("lastTaggedImmunity");
            //Set the last attacking player
            s.score.lastPlayerID = s.score.attackingPlayerID;
            //Update the attacking player
            s.score.attackingPlayerID = newAttacker;
            //Set all players to not be attacking
            for (const id in sg.players) {
                sg.players[id].attacking = false;
            }
            //Set the new attacker to attacking
            sg.players[newAttacker].attacking = true;
            io.emit("newAttacker", newAttacker);
        }
    }

    let _scoring = {
        init: init,
        update: update,
        setNewAttacker: setNewAttacker

    };

    //Export or store it on the app object
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = _scoring;
    } else {
        app.scoring = _scoring;
    }
}());
