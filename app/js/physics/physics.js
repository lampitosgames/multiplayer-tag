"use strict";

//Module that keeps track of the physics simulation
(function() {
    //Modules
    let utils;
    let time;
    let state;
    let sp;
    let Vector;
    let Collider, Manifold, RigidBody;

    function init() {
        //Detect server/client and import other modules
        if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
            utils = require('../utils.js');
            time = require('../time.js');
            state = require('../../server/js/serverState');

            Vector = require('victor');
            Collider = require('./physicsObjects').Collider;
            Manifold = require('./physicsObjects').Manifold;
            RigidBody = require('./physicsObjects').RigidBody;
        } else {
            utils = app.utils;
            time = app.time;
            state = app.state;

            Vector = Victor;
            Collider = app.physObj.Collider;
            Manifold = app.physObj.Manifold;
            RigidBody = app.physObj.RigidBody;
        }

        sp = state.physics;

        sp.gravity = new Vector(0.0, 41);
    }

    function start() {
        //Create a floor
        getRigidBody(0, 20, 40, 1, 0.0, undefined, 1.0);
    }

    function update() {
        //Update rigidBodies
        for (let i=0; i<sp.rigidBodies.length; i++) {
            let body1 = sp.rigidBodies[i];

            body1.applyGravity(sp.gravity);
            body1.update();

            //Check collisions
            for (let k=i+1; k<sp.rigidBodies.length; k++) {
                let body2 = sp.rigidBodies[k];
                //If either has collisions disabled
                if (!body1.hasCollisions || !body2.hasCollisions) {
                    continue;
                }
                //Check the collision
                let m = AABB(body1.col, body2.col);
                //If they are not colliding, continue
                if (m.norm.length() < 1.0) {
                    continue;
                }

                //TODO: Make simpler physics

                // //Get relative velocity
                // let rv = body2.vel.clone().subtract(body1.vel);
                // //Get relative velocity along collision normal
                // let vAlongNorm = rv.dot(m.norm);
                // //If the velocities will already separate the objects, do nothing
                // if (vAlongNorm > 0.0) { continue; }
                // //Use whichever restitution is smaller
                // let e = Math.min(body1.restitution, body2.restitution);
                // //Get the impulse of the collision
                // let j = -(1.0 + e) * vAlongNorm;
                // let impulse = m.norm.clone().multiplyScalar(j);
                //
                // //Apply impulse to the objects
                // body1.vel.subtract(impulse.clone().multiplyScalar(body1.invMass()));
                // body2.vel.add(impulse.clone().multiplyScalar(body2.invMass()));
                //
                // //Positional correction (shift the objects away from the collision)
                // let correction = m.norm.clone().multiplyScalar(m.penetration);
                // //Apply to both objects
                // if (body1.mass != 0) {
                //     body1.pos.subtract(correction.clone());
                // }
                // if (body2.mass != 0) {
                //     body2.pos.add(correction.clone());
                // }
            }
        }
    }

    function getRigidBody(_x, _y, _width, _height, _mass = 1.0, _vel = new Vector(0.0, 0.0), _restitution = 0.0) {
        let rb = new RigidBody(_x, _y, _width, _height, _mass, _vel, _restitution);
        sp.rigidBodies.push(rb);
        return rb;
    }

    //Run AABB algorithm on two colliders and return the collision manifold
    function AABB(col1, col2) {
        //Create an empty collision manifold
        let m = new Manifold();

        //Get centers
        let center1 = col1.center();
        let center2 = col2.center();

        //Center to corner
        let ctc1 = col1.centerToCorner();
        let ctc2 = col2.centerToCorner();

        //Vector from the center of 1 to the center of 2
        let t = center2.clone().subtract(center1);

        /*
    	If the rectangles overlap on an axis, the rects are colliding on it
    	rects      - _________ctc1.x   ______________ctc2.x
    	axis       - ________________________________t.x
    	*/
        //Check x axis
        if (Math.abs(t.x) < ctc1.x + ctc2.x) {
            //Calculate overlap on the x axis
            let xOverlap = ctc1.x + ctc2.x - Math.abs(t.x);
            //Check y axis
            if (Math.abs(t.y) < ctc1.y + ctc2.y) {
                //Calculate overlap on the y axis
                let yOverlap = ctc1.y + ctc2.y - Math.abs(t.y);

                //At this point we know collision is happening.  Find the collision normal
                //If x is smaller
                if (xOverlap < yOverlap) {
                    m.penetration = xOverlap;
                    //Get the direction normal
                    m.norm = new Vector(t.x < 0 ? -1.0 : 1.0, 0.0);
                } else {
                    m.penetration = yOverlap;
                    m.norm = new Vector(0.0, t.y < 0 ? -1.0 : 1.0);
                }
            }
        }
        return m;
    }


    let _physics = {
        init: init,
        start: start,
        update: update,
        getRigidBody: getRigidBody,
        AABB: AABB
    };

    //Export or store it on the app object
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = _physics;
    } else {
        app.physics = _physics;
    }
}());
