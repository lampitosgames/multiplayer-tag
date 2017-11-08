"use strict";

(function() {
    let physics;
    let io;
    let time;
    let s, sp, sg;

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
        /*
         * Common code
         */
        //Get the attacker
        let attacker = sg.players[s.score.attackingPlayerID];
        //If there isn't an attacker, attempt to choose one
        if (attacker == undefined) {
            //If there are no players, return
            if (Object.keys(sg.players).length == 0) {
                return;
            }
            let count = 0;
            //There are players.  Pick a random one
            for (const pID in sg.players) {
                if (Math.random() < 1 / ++count) {
                    setNewAttacker(pID);
                }
            }
        }
        //If there is a new attacker, their ID will go here
        let newAttacker = -1;

        //Loop through all players and check the attecker against them for collision
        for (const id in sg.players) {
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
            sg.players[newAttacker].attacking = true;
            //Set the old attacker to no longer be attacking
            if (s.score.lastPlayerID != undefined) {
                sg.players[s.score.lastPlayerID].attacking = false;
            }
            io.emit("newAttacker", newAttacker);
        }
    }

    function serverUpdate(newAttacker) {
        //If there is a new attacker
        if (newAttacker != -1) {
            //Set the new attacker
            setNewAttacker(newAttacker);
        }
        //If the current attacker is undefined
    }

    function clientUpdate(newAttacker) {
        if (sg.players[sg.clientID].attacking && newAttacker != -1) {
            //If the timer is greater that 250ms, or if it is undefined, send declaration
            if (s.time.timers.clientLastDeclared == undefined || s.time.timers.clientLastDeclared > 0.25) {
                //Send the fact that the client tagged someone to the server.
                //Trust the client here because people will get upset if lag caused them not to tag
                //Don't actually change anything client-side.  That will happen when the server responds
                app.socket.declareNewAttacker(newAttacker);
                console.log("new attacker declared");
                //Reset the timer
                time.startNewTimer("clientLastDeclared");
            }
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
