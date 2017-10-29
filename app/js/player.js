"use strict";

//Player Module that exports a player class
(function() {
    //modules
    let Vector;
    let time;

    function init() {
        //Detect server/client and import other modules
        if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
            Vector = require('victor');
            time = require('./time');
        } else {
            Vector = Victor;
            time = app.time;
        }
    }

    /**
     * The player class.  Represents players on both the client and the server
     */
    function Player(_id, _x, _y) {
        //Store their ID
        this.id = _id;
        //Set position and velocity
        this.pos = new Vector(_x, _y);
        this.vel = new Vector(0, 0);

        /**
         * Called every update.  Should be time independent
         */
        this.update = function() {
            //Update position based on velocity
            this.pos.x += this.vel.x * time.dt();
            this.pos.y += this.vel.y * time.dt();
        }

        /**
         * Get all critical data to send over socket
         */
        this.getData = function() {
            return {
                id: this.id,
                x: this.pos.x,
                y: this.pos.y,
                velX: this.vel.x,
                velY: this.vel.y
            };
        }

        /**
         * Set player data based on updated information
         */
        this.setData = function(data) {
            this.pos.x = data.x;
            this.pos.y = data.y;
            this.vel.x = data.velX;
            this.vel.y = data.velY;
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
