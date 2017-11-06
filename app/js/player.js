"use strict";

//Player Module that exports a player class
(function() {
    //modules
    let Vector;
    let time;
    let physics;

    //State
    let s, sp, sg, st;

    function init() {
        //Detect server/client and import other modules
        if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
            Vector = require('victor');
            time = require('./time');
            physics = require('./physics/physics');
            s = require('../server/js/serverState');
        } else {
            Vector = Victor;
            time = app.time;
            physics = app.physics;
            s = app.state;
        }
        sp = s.physics;
        sg = s.game;
        st = s.time;
    }

    /**
     * The player class.  Represents players on both the client and the server
     */
    function Player(_id, _x, _y) {
        //Store their ID
        this.id = _id;
        //Create a rigid body for the player
        this.gameObject = physics.getGameObject(_x, _y, 1, 1);

        //Init player input.  Everything is false by default
        this.moveLeft = false;
        this.moveRight = false;
        this.sprint = false;
        this.shouldJump = false;
        this.jump = 0;

        /**
         * Called every update.  Should be time independent
         */
        this.update = function() {
            //If moving left
            this.gameObject.vel.x = 0;
            if (this.moveLeft) {
                this.gameObject.vel.add(new Vector(this.sprint ? -sp.moveSpeed * sp.sprintMult : -sp.moveSpeed, 0.0));
            }
            //If moving right
            if (this.moveRight) {
                this.gameObject.vel.add(new Vector(this.sprint ? sp.moveSpeed * sp.sprintMult : sp.moveSpeed, 0.0));
            }
            //If jumping
            if (this.shouldJump == true) {
                this.gameObject.vel.add(sp.jumpVel);
                this.gameObject.jump++;
                this.shouldJump = false;
            }
        }

        /**
         * Get all critical data to send over socket
         */
        this.getData = function() {
            return {
                id: this.id,
                time: st.clientTimers[this.id],
                moveLeft: this.moveLeft,
                moveRight: this.moveRight,
                sprint: this.sprint,
                shouldJump: this.shouldJump,
                gameObject: this.gameObject.getData()
            };
        }

        /**
         * Set player data based on updated information
         */
        this.setData = function(data) {
            this.moveLeft = data.moveLeft;
            this.moveRight = data.moveRight;
            this.sprint = data.sprint;
            this.shouldJump = data.shouldJump;

            let timer = st.clientTimers[data.id];

            this.gameObject.setData(data.gameObject, timer - data.time);

            st.clientTimers[data.id] = data.time;
        }
    }

    let _Player = {
        Player: Player,
        init: init
    }

    //Export or store it on the app object
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = _Player;
    } else {
        app.p = _Player;
    }
}());
