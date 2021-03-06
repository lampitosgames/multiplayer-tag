"use strict";

//The state module contains state for all other modules, providing easy data access and modification from anywhere in the app
app.state = (function() {
    let a = app;

    //Enum values for all the state.  Keys must be unique
    let e = {
        //CLIENT STATES
        LOADING: 1000,
        TUTORIAL_SCREEN: 1001,
        START_SCREEN: 1002,
        CONNECTING: 1003,
        PLAYING: 1004,

        //GAME STATES
        GAME_WAITING_FOR_PLAYERS: 2000,
        GAME_STARTING_SOON: 2001,
        GAME_PLAYING: 2002,
        GAME_OVER: 2003,
        GAME_RESETTING: 2004,

        //GENERAL CONSTANTS
        DEFAULT_VOLUME: 1.0,
        MUSIC_VOLUME: 0.35
    };

    //Main module state
    let game = {
        //ID of the animation being used
        animationID: 0,
        //Client state.  LOADING by default
        clientState: e.LOADING,
        //Game state.  GAME_WAITING_FOR_PLAYERS by default
        gameState: e.GAME_WAITING_FOR_PLAYERS,
        //Game Unit.  32 pixels
        gu: 30,
        //Player ID of the client
        clientID: undefined,
        //Is the player joining a game
        connecting: false,
        //Holds all player data
        players: {},
        //An array of promises.  Once they all resolve, all assets have loaded
        loading: [],
        //Particle emitter that marks the attacker
        attackerEmitter: undefined,
        //Total number of assets loaded asynchronously
        numAssetsLoading: 0
    };

    let score = {
        attackingPlayerID: undefined,
        lastAttacker: undefined,
        winner: undefined,
        immunityLength: 3,
        gameLength: 180,
        endscreenLength: 10,
        startCountdownLength: 15,

        //Used for the almost over buzzer
        lastBuzzerSecond: 16,
        playedGameEndSound: false
    };

    let physics = {
        lastGameObjectID: 0,
        lastPlatformID: 0,
        speedLimit: 0,
        jumpHeight: 0,
        jumpTime: 0,
        gravity: undefined,
        jumpVel: undefined,
        moveSpeed: undefined,
        sprintMult: undefined,
        platforms: [],
        gameObjects: {}
    };

    let player = {
        shouldUpdateServer: false,
        moveLeft: false,
        moveRight: false,
        dropDown: false,
        sprint: false,
        shouldJump: false
    };

    let audio = {
        audioCtx: undefined,
        soundNames: [
            "backgroundMusic.mp3", "countdown.wav", "gameOver.wav", "jump.wav", "playerTagged.wav"
        ],
        sounds: {}
    }

    let image = {
        tilesheetNames: [
            "core_spritesheet", "winter_spritesheet"
        ],
        spritesheetNames: [
            "p1_spritesheet", "p2_spritesheet"
        ],
        backgroundNames: ["bg_grasslands.png"],
        tutorialImg: undefined,
        tilesheets: {},
        spritesheets: {},
        sprites: {},
        backgrounds: {}
    }

    let view = {
        active: undefined,
        viewScale: 50
    }

    //Time module state
    let time = {
        //Delta time
        dt: 0,
        //Total time the app has been running
        runTime: 0,
        //Timestamp of the last update loop
        lastTime: 0,
        //Current frames per second
        fps: 0,
        //Timers for individual clients so that syncing can happen properly
        clientTimers: {},
        //General timers with unique ids
        timers: {}
    };

    //Expose all state variables to the app
    return {
        e: e,
        game: game,
        score: score,
        physics: physics,
        player: player,
        image: image,
        audio: audio,
        view: view,
        time: time
    };
}());
