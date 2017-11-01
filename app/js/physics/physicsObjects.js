"use strict";

//Module that keeps track of the physics simulation
(function() {
    //Modules
    let Vector;
    let time;
    let sp;
    let physics;

    function init() {
        //Detect server/client and import other modules
        if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
            Vector = require('victor');
            time = require('../time');
            sp = require('../../server/js/serverState').physics;
            physics = require('./physics');
        } else {
            Vector = Victor;
            time = app.time;
            sp = app.state.physics;
            physics = app.physics;
        }
    }

    function Platform(_x, _y, _width, _height) {
        this.id = sp.lastPlatformID++;
        this.pos = new Vector(_x, _y);
        this.width = _width;
        this.height = _height;
        giveCollisionHelpers.bind(this)();
    }

    function GameObject(_x, _y, _width, _height, _vel = new Vector(0.0, 0.0)) {
        this.id = sp.lastGameObjectID++;
        //Kinematic Properties
        this.pos = new Vector(_x, _y);
        this.vel = _vel;
        this.accel = new Vector(0.0, 0.0);

        //Dimensions in game units
        this.width = _width;
        this.height = _height;

        //Physics properties
        this.hasGravity = false;
        this.hasCollisions = true;

        this.update = function() {
            //Add acceleration to the velocity scaled by dt
            this.vel.add(this.accel.multiplyScalar(time.dt()));
            //Add velocity to the position scaled by dt
            this.pos.add(this.vel.clone().multiplyScalar(time.dt()));

            //Reset acceleration
            this.accel = new Vector(0.0, 0.0);
        }

        this.applyGravity = function(grav) {
            if (this.hasGravity) {
                this.accel.add(grav);
            }
        }

        this.applyPlatformCollision = function(platforms) {
            if (!this.hasCollisions) {
                //Object can't collide, so it is not colliding
                return false;
            }
            //Not colliding until proven otherwise
            let isColliding = false;

            //Loop through all platforms
            for (let k=0; k<platforms.length; k++) {
                let plat = platforms[k];
                //Check the collision
                let m = physics.AABB(this, plat);
                //If they are not colliding, continue
                if (m.norm.length() < 1.0) {
                    continue;
                }

                //Collision is to the left
                if (m.norm.x < 0) {
                    this.vel.x = 0;
                    this.xMin(plat.xMax());
                    isColliding = true;
                }
                //Collision is to the right
                if (m.norm.x > 0) {
                    this.vel.x = 0;
                    this.xMax(plat.xMin());
                    isColliding = true;
                }
                //Collision is to the top
                if (m.norm.y < 0) {
                    this.vel.y = 0;
                    this.yMin(plat.yMax());
                    isColliding = true;
                }
                //Collision is to the bottom
                if (m.norm.y > 0) {
                    this.vel.y = 0;
                    this.yMax(plat.yMin());
                    isColliding = true;
                }
            }
            return isColliding;
        }

        /*
         * Attach Collision Helper Functions
         */
        giveCollisionHelpers.bind(this)();

        /*
         * Socket Transmission data
         */
        this.getData = function() {
            return {
                id: this.id,
                x: this.pos.x,
                y: this.pos.y,
                velX: this.vel.x,
                velY: this.vel.y,
                width: this.width,
                height: this.height,
                hasGravity: this.hasGravity,
                hasCollisions: this.hasCollisions
            }
        }
        this.setData = function(data) {
            this.id = data.id;
            this.pos.x = data.x;
            this.pos.y = data.y;
            this.vel.x = data.velX;
            this.vel.y = data.velY;
            this.width = data.width;
            this.height = data.height;
            this.hasGravity = data.hasGravity;
            this.hasCollisions = data.hasCollisions;
        }
    }

    function Manifold(_norm = new Vector(0.0, 0.0), _penetration = new Vector(0.0, 0.0)) {
        this.norm = _norm;
        this.penetration = _penetration;
    }

    /**
     * Private function that gives physics objects helper properties for collisions
     * Must bind this function to the object before calling it
     */
    function giveCollisionHelpers() {
        this.center = function() {
            return this.pos.clone().add(new Vector(this.width / 2, this.height / 2));
        }
        this.centerToCorner = function() {
            return this.center().subtract(this.pos);
        }
        this.xMin = function(set = undefined) {
            if (set == undefined) {
                return this.pos.x;
            } else {
                this.pos.x = set;
            }
        }
        this.xMax = function(set = undefined) {
            if (set == undefined) {
                return this.pos.x + this.width;
            } else {
                this.pos.x = set - this.width;
            }
        }
        this.yMin = function(set = undefined) {
            if (set == undefined) {
                return this.pos.y;
            } else {
                this.pos.y = set;
            }
        }
        this.yMax = function(set = undefined) {
            if (set == undefined) {
                return this.pos.y + this.height;
            } else {
                this.pos.y = set - this.height;
            }
        }
    }

    let _physicsObjects = {
        init: init,
        Manifold: Manifold,
        GameObject: GameObject,
        Platform: Platform
    };

    //Export or store it on the app object
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = _physicsObjects;
    } else {
        app.physObj = _physicsObjects;
    }
}());
