"use strict";

/**
 * Player module that exports a player class
 * Instances of the player can be created on both the server and the client and
 * synced between them
 */
(function() {
    //Modules
    let Vector;
    let time;
    let physics;

    //State shorthand
    let s,
        sp,
        sg,
        st;

    /**
     * Init the player module
     */
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
        //Get shorthand state
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
        this.gameObject = physics.getGameObject(_x, _y, 1, 1.3158);

        //Player input tracking.  Everything is false by default
        this.moveLeft = false;
        this.moveRight = false;
        this.sprint = false;
        this.shouldJump = false;
        this.jump = 0;

        //Gameplay state variables
        this.attacking = false;
        this.attackTimer = 0;

        /**
         * Called every update.  Should be time independent
         */
        this.update = function() {
            //Set the hor velocity to zero
            this.gameObject.vel.x = 0;
            //If moving left, move left
            if (this.moveLeft) {
                this.gameObject.vel.add(new Vector(this.sprint
                    ? -sp.moveSpeed * sp.sprintMult
                    : -sp.moveSpeed, 0.0));
            }
            //If moving right, move right
            if (this.moveRight) {
                this.gameObject.vel.add(new Vector(this.sprint
                    ? sp.moveSpeed * sp.sprintMult
                    : sp.moveSpeed, 0.0));
            }
            //If jumping, jump
            if (this.shouldJump == true) {
                this.gameObject.vel.y = sp.jumpVel.y;
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
                attacking: this.attacking,
                attackTimer: this.attackTimer,
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
            this.attacking = data.attacking;
            this.attackTimer = data.attackTimer;

            let timer = st.clientTimers[data.id];

            this.gameObject.setData(data.gameObject, timer - data.time);

            st.clientTimers[data.id] = data.time;
        }

        /**
         * Set data from the server for THIS client.
         * This means the game is client-authoritative.
         */
        this.setClientData = function(data) {
            this.attacking = data.attacking;
            this.attackTimer = data.attackTimer;
            st.clientTimers[data.id] = data.time;
        }
    }

    //Export everything
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
