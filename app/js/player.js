"use strict";

//Player Module that exports a player class
(function() {
    //modules
    let Vector;
    let time;
    let physics;

    //State
    let s, sp, sg;

    function init() {
        //Detect server/client and import other modules
        if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
            Vector = require('victor');
            time = require('./time');
            physics = require('./physics/physics');
        } else {
            Vector = Victor;
            time = app.time;
            physics = app.physics;
        }
    }

    /**
     * The player class.  Represents players on both the client and the server
     */
    function Player(_id, _x, _y) {
        //Store their ID
        this.id = _id;
        //Create a rigid body for the player
        this.gameObject = physics.getGameObject(_x, _y, 1, 1);

        /**
         * Called every update.  Should be time independent
         */
        this.update = function() {

        }

        /**
         * Get all critical data to send over socket
         */
        this.getData = function() {
            return {
                id: this.id,
                gameObject: this.gameObject.getData()
            };
        }

        /**
         * Set player data based on updated information
         */
        this.setData = function(data) {
            this.gameObject.setData(data.gameObject);
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
