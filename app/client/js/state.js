"use strict";
//The state module contains state for all other modules, providing easy data access and modification from anywhere in the app
app.state = (function() {
    let a = app;

    //Enum values for all the state.  Keys must be unique
    let e = {
        //GAME STATES
        //Given unique values
        BEGIN: 1000,
        DEFAULT: 2000,
        EXPLODING: 3000,
        ROUND_OVER: 4000,
        REPEAT_LEVEL: 5000,
        END: 6000,

        START_RADIUS: 10,
        MAX_RADIUS: 60,
        MIN_RADIUS: 2,
        MAX_LIFETIME: 2.5,
        MAX_SPEED: 500,
        EXPLOSION_SPEED: 90,
        IMPLOSION_SPEED: 120
    };

    //Main module state
    let main = {
        //ID of the animation being used
        animationID: 0,
        //All derived from the particle class.  Game objects, basically
        numCircles: undefined,
        particles: undefined,
        explosions: undefined,
        cursor: undefined,
        //Score and level stuff
        gameState: undefined,
        currentLevel: -1,
        roundScore: 0,
        totalScore: 0,
        //Toggleable states
        debug: false,
        paused: false,
        //Cheat to make testing faster
        dtMultiplier: 1
    };

    //Time module state
    let time = {
        //Delta time
        dt: 0,
        //Total time the app has been running
        runTime: 0,
        //Timestamp of the last update loop
        lastTime: 0,
        //Current frames per second
        fps: 0
    };

    let levels = [
        //Level 1
        {
            numCircles: 20,
            targetNum: 8,
            failMessage: "So close! Or were  you?",
            winMessage: "Hurray!"
        },
        //Level 2
        {
            numCircles: 40,
            targetNum: 30,
            failMessage: "This is an unhelpful message of encouragement.",
            winMessage: "You're past the worst of it.  Maybe."
        },
        // //Level 3
        {
            numCircles: 50,
            targetNum: 40,
            failMessage: "Win some, lose some.",
            winMessage: "High score! Wait, I didn't implement that..."
        },
        //LEVEL 4
        {
            numCircles: 60,
            targetNum: 52,
            failMessage: "Just keep swimming...",
            winMessage: "Here comes the final level!"
        },
        //LEVEL 5
        {
            numCircles: 200,
            targetNum: 198,
            failMessage: "Not everyone is good at things.",
            winMessage: "You win!"
        }
    ];

    let colors = ["#FD5B78", "#FF6037", "#FF9966", "#66FF66", "#50BFE6", "#FF6EFF", "#EE34D2"];

    //Expose all state variables to the app
    return {
        e: e,
        main: main,
        time: time,
        levels: levels,
        colors: colors
    };
}());
