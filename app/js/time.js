"use strict";

/**
 * Timing module keeps track of the delta time and runtime of the app.
 * Also allows for the creation of individual timers
 * Client/server agnostic
 */
(function() {
    //Modules
    let utils;
    let s,
        st;

    /**
     * Init the timing module
     */
    function init() {
        //Detect server/client and import other modules
        if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
            utils = require('./utils.js');
            s = require('../server/js/serverState');
        } else {
            utils = app.utils;
            s = app.state;
        }
        //Shorthand state
        st = s.time;
    }

    /**
     * Calculates the time between frames
     */
    function calculateDeltaTime() {
        //Get time in ms
        let now = Date.now();
        //Get capped instant FPS (from last frame to this frame)
        st.fps = utils.clamp(1000 / (now - st.lastTime), 5, 60);
        //Store this frame time
        st.lastTime = now;
        //Return the last frame's time (delta time) in seconds
        return 1 / st.fps;
    }

    /**
     * Update the module
     */
    function update() {
        //Get the delta time
        st.dt = calculateDeltaTime();
        //Add the delta to the total runtime
        st.runTime += st.dt;
        //Add the delta to all client timers
        for (const t in st.clientTimers) {
            st.clientTimers[t] += st.dt;
        }
        //Add the delta to all other timers
        for (const t in st.timers) {
            st.timers[t] += st.dt;
        }
    }

    /**
     * Start a timer that will be synced between server and client and used
     * for lag calculations
     */
    function startClientTimer(_id, _serverTime) {
        st.clientTimers[_id] = _serverTime;
    }

    /**
     * Start a general-purpose timer
     */
    function startNewTimer(_id) {
        st.timers[_id] = 0;
    }

    /**
     * Export Everything
     */
    let _time = {
        calculateDeltaTime: calculateDeltaTime,
        startClientTimer: startClientTimer,
        startNewTimer: startNewTimer,
        update: update,
        init: init,
        dt: function() {
            return st.dt;
        },
        runTime: function() {
            return st.runTime;
        },
        fps: function() {
            return st.fps;
        }
    };

    //Export or store it on the app object
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = _time;
    } else {
        app.time = _time;
    }
}());
