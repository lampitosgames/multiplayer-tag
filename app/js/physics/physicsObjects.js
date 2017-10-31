"use strict";

//Module that keeps track of the physics simulation
(function() {
    //Modules
    let Vector;
    let time;
    let sp;

    function init() {
        //Detect server/client and import other modules
        if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
            Vector = require('victor');
            time = require('../time');
            sp = require('../../server/js/serverState').physics;
        } else {
            Vector = Victor;
            time = app.time;
            sp = app.state.physics;
        }
    }

    function Collider(_x, _y, _width, _height) {
        this.pos = new Vector(_x, _y);
        this.width = _width;
        this.height = _height;

        this.center = function() {
            return this.pos.clone().add(new Vector(this.width/2, this.height/2));
        }
        this.centerToCorner = function() {
            return this.center().subtract(this.pos);
        }

        this.getData = function() {
            return {
                x: this.pos.x,
                y: this.pos.y,
                width: this.width,
                height: this.height
            }
        }
        this.setData = function(data) {
            this.pos.x = data.x;
            this.pos.y = data.y;
            this.width = data.width;
            this.height = data.height;
        }
    }

    function Manifold(_norm = new Vector(0.0, 0.0), _penetration = new Vector(0.0, 0.0)) {
        this.norm = _norm;
        this.penetration = _penetration;
    }

    function RigidBody(_x, _y, _width, _height, _mass = 1.0, _vel = new Vector(0.0, 0.0), _restitution = 0.0) {
        this.id = sp.lastRigidBodyID++;
        //Kinematic properties
        this.pos = new Vector(_x, _y);
        this.vel = _vel;
        this.accel = new Vector(0.0, 0.0);

        //AABB Collider
        this.col = new Collider(_x, _y, _width, _height);

        //Physics properties
        this.netForce = new Vector(0.0, 0.0);
        this.mass = _mass;
        this.restitution = _restitution;
        this.hasGravity = false;
        this.hasCollisions = true;

        this.update = function() {
            //Average acceleration between frames for smoother movement
            let newAccel = new Vector(0.0, 0.0);
            //F = ma
            if (this.mass > 0) {
                newAccel = this.netForce.clone().divideScalar(this.mass);
            }
            let avgAccel = this.accel.add(newAccel).multiplyScalar(0.5);
            this.accel = newAccel;

            //Add acceleration to the velocity scaled by dt
            this.vel.add(avgAccel.multiplyScalar(time.dt()));
            //Add velocity to the position scaled by dt
            this.pos.add(this.vel.clone().multiplyScalar(time.dt()));
            //Update collider position
            this.col.pos = this.pos;

            //Reset net force
            this.netForce = new Vector(0.0, 0.0);
        }

        this.applyForce = function(force) {
            this.netForce.add(force);
        }

        this.applyGravity = function(grav) {
            if (this.hasGravity) {
                this.applyForce(grav.clone().multiplyScalar(this.mass));
            }
        }

        this.invMass = function() {
            return (this.mass == 0) ? 0 : 1.0/this.mass;
        }

        this.getData = function() {
            return {
                id: this.id,
                x: this.pos.x,
                y: this.pos.y,
                velX: this.vel.x,
                velY: this.vel.y,
                accelX: this.accel.x,
                accelY: this.accel.y,
                collider: this.col.getData(),
                mass: this.mass,
                restitution: this.restitution,
                hasGravity: this.hasGravity,
                hasCollisions: this.hasCollisions
            }
        }
        this.setData = function(data) {
            this.id = data.id;
            this.pos = new Vector(data.x, data.y);
            this.vel = new Vector(data.velX, data.velY);
            this.accel = new Vector(data.accelX, data.accelY);
            this.col.setData(data.collider);
            this.mass = data.mass;
            this.restitution = data.restitution;
            this.hasGravity = data.hasGravity;
            this.hasCollisions = data.hasCollisions;
        }
    }


    let _physicsObjects = {
        init: init,
        Collider: Collider,
        Manifold: Manifold,
        RigidBody: RigidBody
    };

    //Export or store it on the app object
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = _physicsObjects;
    } else {
        app.physObj = _physicsObjects;
    }
}());
