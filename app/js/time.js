"use strict";

//Timing module for delta time and FPS
(function() {
    //Modules
    let utils;
    let s, st;

    function init() {
        //Detect server/client and import other modules
        if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
            utils = require('./utils.js');
            s = require('../server/js/serverState');
        } else {
            utils = app.utils;
            s = app.state;
        }
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

    function startClientTimer(_id, _serverTime) {
        st.clientTimers[_id] = _serverTime;
    }

    function startNewTimer(_id) {
        st.timers[_id] = 0;
    }

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
