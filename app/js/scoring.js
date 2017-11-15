"use strict";

/**
 * Scoring module tracks everything about the game score and win conditions
 * Client/server agnostic, though there is some code that runs specifically on
 * one or the other
 */
(function() {
    let physics;
    let io;
    let time;
    let s,
        sp,
        sg;

    //Server or client
    let useNodeJS = false;

    /**
     * Initialize the scoring module
     */
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
        //Shorthand state
        sg = s.game;
        sp = s.physics;

    }

    /**
     * Update the scoring module
     */
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
            //Set every player to not attacking
            sg.players[id].attacking = false;
            //If this player is attacking
            if (id == s.score.attackingPlayerID) {
                //Set them to attacking and continue (don't check collisions against self)
                sg.players[id].attacking = true;
                continue;
            }

            //Check AABB with attacker
            let m = physics.AABB(attacker.gameObject, sg.players[id].gameObject);
            //If the players are not colliding, continue
            if (m.norm.lengthSq() < 1.0) {
                continue;
            }
            //Players are colliding.  Set the new new attacker
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

    /**
     * Update loop code that runs server-side
     */
    function serverUpdate(newAttacker) {
        //If there isn't an attacker, attempt to choose one
        if (s.score.attackingPlayerID == undefined) {
            //If there are no players, return
            if (Object.keys(sg.players).length == 0) {
                return;
            }
            //There are players, set the first one as the attacker so the game can continue
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

        //Do different things based on the game state
        switch (sg.gameState) {
                //The game is waiting for players
            case s.e.GAME_WAITING_FOR_PLAYERS:
                //If enough players have joined, begin the start countdown
                if (Object.keys(sg.players).length > 1) {
                    time.startNewTimer("gameStartTimer");
                    //Switch the game state
                    sg.gameState = s.e.GAME_STARTING_SOON;
                }
                break;
                //There are enough players.  Count down to the game beginning to give more players time to join
            case s.e.GAME_STARTING_SOON:
                //If the start timer runs out
                if (s.time.timers["gameStartTimer"] >= s.score.startCountdownLength) {
                    //Start the game timer
                    time.startNewTimer("gameTimer");
                    //Begin the game
                    sg.gameState = s.e.GAME_PLAYING;
                }
                break;
                //The game is running
            case s.e.GAME_PLAYING:
                //If the number of players ever drops to 1, end the game
                if (Object.keys(sg.players).length < 2) {
                    time.startNewTimer("gameOverTimer");
                    sg.gameState = s.e.GAME_OVER;
                    return;
                }

                //Increment how long the attacker has been attacking
                sg.players[s.score.attackingPlayerID].attackTimer += time.dt();

                //If the game has ended
                if (s.time.timers["gameTimer"] >= s.score.gameLength) {
                    //Start the end screen timer
                    time.startNewTimer("gameOverTimer");
                    //Set the game to over
                    sg.gameState = s.e.GAME_OVER;

                    //Initialize winner vars
                    let winnerID = undefined;
                    let winnerScore = 90000;
                    //Loop through every player and find the one with the lowest amount of attack time
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
                //The game is over
            case s.e.GAME_OVER:
                //If the game has been over for a while
                if (s.time.timers["gameOverTimer"] >= s.score.endscreenLength) {
                    //Reset the game
                    sg.gameState = s.e.GAME_RESETTING;
                }
                break;
                //The game is resetting.  This code should only run once
            case s.e.GAME_RESETTING:
                //Reset the game state
                sg.gameState = s.e.GAME_WAITING_FOR_PLAYERS;
                //Loop through all players and reset their attack timers to zero
                for (const p in sg.players) {
                    sg.players[p].attackTimer = 0;
                }
                //Emit a client reset game event
                io.emit("resetGame");
                break;
        }
    }

    /**
     * Update loop code that runs client-side
     */
    function clientUpdate(newAttacker) {
        //If the client hasn't connected yet, do nothing
        if (sg.players[sg.clientID] == undefined) {
            return;
        }
        //If the client is attacking and has detected a new attacker
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

    /**
     * Only runs server-side
     * Sets and declares a new attacker
     */
    function setNewAttacker(newAttacker) {
        //If the attacker hasn't changed asynchronously
        if (newAttacker != s.score.attackingPlayerID) {
            //If the last tagged player is the new attacker and their immunity timer is still valid, do nothing
            if (newAttacker == s.score.lastPlayerID && s.time.timers.lastTaggedImmunity < s.score.immunityLength) {
                return;
            }
            //Start a new immunity timer
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
            //Emit that there is a new attacker
            io.emit("newAttacker", newAttacker);
        }
    }

    //Export everything
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
