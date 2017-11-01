"use strict";

//Module that keeps track of the physics simulation
(function() {
    //Modules
    let utils;
    let time;
    let state;
    let sp;
    let Vector;
    let Manifold, GameObject, Platform;

    function init() {
        //Detect server/client and import other modules
        if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
            utils = require('../utils.js');
            time = require('../time.js');
            state = require('../../server/js/serverState');

            Vector = require('victor');
            Manifold = require('./physicsObjects').Manifold;
            GameObject = require('./physicsObjects').GameObject;
            Platform = require('./physicsObjects').Platform;
        } else {
            utils = app.utils;
            time = app.time;
            state = app.state;

            Vector = Victor;
            Manifold = app.physObj.Manifold;
            GameObject = app.physObj.GameObject;
            Platform = app.physObj.Platform;
        }

        sp = state.physics;

        sp.gravity = new Vector(0.0, 41);
    }

    function start() {
        //Create a floor
        getPlatform(0, 20, 40, 1);
    }

    function update() {
        //Update gameObjects
        for (const goID in sp.gameObjects) {
            let obj = sp.gameObjects[goID];

            let colliding = obj.applyPlatformCollision(sp.platforms);
            if (!colliding) {
                obj.applyGravity(sp.gravity);
            }
            obj.update();
        }
    }

    function getGameObject(_x, _y, _width, _height, _vel = new Vector(0.0, 0.0)) {
        let go = new GameObject(_x, _y, _width, _height, _vel);
        sp.gameObjects[go.id] = go;
        return go;
    }
    function getPlatform(_x, _y, _width, _height) {
        let plat = new Platform(_x, _y, _width, _height);
        sp.platforms.push(plat);
        return plat;
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
        getGameObject: getGameObject,
        AABB: AABB
    };

    //Export or store it on the app object
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = _physics;
    } else {
        app.physics = _physics;
    }
}());
