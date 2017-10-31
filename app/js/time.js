"use strict";

//Timing module for delta time and FPS
(function() {
    //Modules
    let utils;

    //Member vars
    let fps = 60;
    let runTime = 0;
    let lastTime = 0;
    let dt = 0;

    function init() {
        //Detect server/client and import other modules
        if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
            utils = require('./utils.js');
        } else {
            utils = app.utils;
        }
    }

    /**
     * Calculates the time between frames
     */
    function calculateDeltaTime() {
        //Get time in ms
        let now = Date.now();
        //Get capped instant FPS (from last frame to this frame)
        fps = utils.clamp(1000 / (now - lastTime), 5, 60);
        //Store this frame time
        lastTime = now;
        //Return the last frame's time (delta time) in seconds
        return 1 / fps;
    }

    /**
     * Update the module
     */
    function update() {
        //Get the delta time
        dt = calculateDeltaTime();
        //Add the delta to the total runtime
        runTime += dt;
    }

    let _time = {
        calculateDeltaTime: calculateDeltaTime,
        update: update,
        init: init,
        dt: function() {
            return dt;
        },
        runTime: function() {
            return runTime;
        },
        fps: function() {
            return fps;
        }
    };

    //Export or store it on the app object
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = _time;
    } else {
        app.time = _time;
    }
}());
