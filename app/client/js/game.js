"use strict";

/**
 * The game module.  Runs everything about the game
 * Its a little sloppy due to time constraints
 */
app.game = (function() {
    let a = app;
    let s,
        sg,
        se,
        st,
        sp,
        sv,
        si;

    /**
     * Initialization
     */
    function init() {
        //Shorthand state
        s = a.state;
        sg = s.game;
        se = s.e;
        st = s.time;
        sp = s.physics;
        sv = s.view;
        si = s.image;

        //Init the main view
        sv.active = new a.view.View(0, 0, 100, 100);

        //Bind resize, then call it as part of initialization
        window.addEventListener("resize", resize);
    }

    /**
     * Start function called after all modules have been initialized
     */
    function start() {
        //Resize the window
        resize();
        //Start the physics simulation
        a.physics.start();
        //Start the keys module
        a.keys.start();
        //Load the level
        //TODO: Make level selection a thing
        a.levelLoader.start();

        //Start the update loop
        update();
    }

    /**
     * Main update loop of the game
     */
    function update() {
        //Start the animation loop
        sg.animationID = requestAnimationFrame(update);

        //Switch based on client state
        //Note that these screens really should each have their own module.  I did them all in the game module to save on time
        switch (sg.clientState) {
                //If assets are still loading
            case se.LOADING:
                //Show the loading screen
                updateLoading();
                return;
                //If viewing tutorial
            case se.TUTORIAL_SCREEN:
                //Display tutorial
                updateTutorial();
                return;
                //If on the start screen
            case se.START_SCREEN:
                //Show start screen
                updateStartScreen();
                return;
                //If connecting
            case se.CONNECTING:
                //Show connecting screen
                updateConnecting();
                return;
                //The default.  Update as normal
            case se.PLAYING:
                break;
        }

        //Play background music if it isn't already playing and if the game isn't over
        if (!s.audio.sounds["backgroundMusic.mp3"].playing && sg.gameState != s.e.GAME_OVER) {
            s.audio.sounds["backgroundMusic.mp3"].start();
            s.audio.sounds["backgroundMusic.mp3"].gain.gain.value = s.e.MUSIC_VOLUME;
        }
        //Create a particle emitter if it doesn't already exist
        if (!sg.attackerEmitter) {
            sg.attackerEmitter = new a.particle.Emitter(new Victor(sg.gu, sg.gu), new Victor(0.0, 0.1));
        }

        //Update all client-side modules
        a.time.update();
        a.physics.update();
        a.playerUpdates.update();
        a.audio.update();
        a.scoring.update();

        //Store the drawing context shorthand
        let c = a.ctx;
        //Re-draw the background
        c.fillStyle = "white";
        c.fillRect(0, 0, a.viewport.width, a.viewport.height);

        //Draw everything in the image module (tiles and backgrounds)
        a.image.draw();

        //Update the attacker's emitter
        sg.attackerEmitter.update();

        //Draw all players
        for (const p in sg.players) {
            //Get and update the player
            let player = sg.players[p];
            player.update();

            //Get the player sprite to draw
            let playerSprite = "p1";
            //Get relative position of the player in the view
            let relativePos = sv.active.getObjectRelativePosition(player.gameObject, true);

            //Move the particle emitter to the attacking player
            if (sg.players[p].attacking) {
                sg.attackerEmitter.pos = sg.players[p].gameObject.pos.clone();
                sg.attackerEmitter.pos.x += sg.players[p].gameObject.width / 2;
                sg.attackerEmitter.pos.y += sg.players[p].gameObject.height / 2;
                //Draw as the attacking player
                playerSprite = "p2";
            }

            //Select which sprite to draw based on player movement state
            //Jumping and falling sprites
            if (player.gameObject.drop) {
                if (player.gameObject.vel.x >= 0) {
                    playerSprite += "DropRight";
                } else {
                    playerSprite += "DropLeft";
                }
            } else if (player.gameObject.vel.y < 0) {
                if (player.gameObject.vel.x >= 0) {
                    playerSprite += "JumpRight";
                } else {
                    playerSprite += "JumpLeft";
                }
                //Not moving vertically
            } else {
                if (player.gameObject.vel.x > 0) {
                    playerSprite += "RightWalk";
                } else if (player.gameObject.vel.x < 0) {
                    playerSprite += "LeftWalk";
                } else {
                    playerSprite += "Stand";
                }
            }
            //Draw the player sprite (automatically animates based on delta time)
            si.sprites[playerSprite].draw(c, relativePos.x, relativePos.y, player.gameObject.width * sg.gu, player.gameObject.height * sg.gu);
        }

        //Make the view follow the client player
        if (sg.players[sg.clientID] != undefined) {
            sv.active.follow(sg.players[sg.clientID].gameObject.center().clone().multiplyScalar(sg.gu));
        }

        //Draw GUI
        drawGUI();

        //If the game is paused, draw the pause pause screen
        if (sg.clientState == se.PAUSED) {
            updatePaused();
        }
    }

    /**
     * Update the loading screen
     */
    function updateLoading() {
        //If there are still promises
        if (sg.loading.length > 0) {
            //Draw progress bar
            let c = a.ctx;
            c.fillStyle = "white";
            c.fillRect(0, 0, a.viewport.width, a.viewport.height);
            a.drawing.drawText("Loading...", a.viewport.width / 2, a.viewport.height / 2, "48px Grobold", "rgba(100, 100, 100, 1.0)");
            a.drawing.drawProgressBar(a.viewport.width / 4, a.viewport.height / 2 + 100, a.viewport.width / 2, 50, "grey", "red", sg.loading.length, sg.numAssetsLoading, 0);
            return;
            //Everything has loaded
        } else {
            //Set the state to display the start screen
            sg.clientState = se.TUTORIAL_SCREEN;
        }
    }

    /**
     * Update the tutorial screen.
     */
    function updateTutorial() {
        let c = a.ctx;
        c.fillStyle = "white";
        c.fillRect(0, 0, a.viewport.width, a.viewport.height);

        //Get the tutorial image
        let img = si.tutorialImg;
        //Get the width/height of the tutorial image
        let dWidth = img.width;
        let dHeight = img.height;

        //If the image is wider/taller than the screen, scale it down
        if (img.width > a.viewport.width || img.height > a.viewport.height) {
            dWidth = a.viewport.width > a.viewport.height
                ? a.viewport.height
                : a.viewport.width;
            dHeight = dWidth;
        }
        //Center the image
        let dx = (a.viewport.width / 2) - (dWidth / 2);
        let dy = (a.viewport.height / 2) - (dHeight / 2);

        //Draw the image
        c.drawImage(img.img, dx, dy, dWidth, dHeight);

        //If the user clicks, go to the start screen
        if (a.keys.mouseDown()) {
            sg.clientState = se.START_SCREEN;
        }
    }

    /**
     * Draw the start screen and detect "join game" button presses
     */
    function updateStartScreen() {
        let c = a.ctx;
        c.fillStyle = "white";
        c.fillRect(0, 0, a.viewport.width, a.viewport.height);
        a.drawing.drawText("Spaceman Tag", a.viewport.width / 2, a.viewport.height / 3, "60px Grobold", "rgba(100, 100, 100, 1.0)");

        c.fillStyle = "rgb(240, 100, 100)";
        c.strokeStyle = "rgb(100, 100, 100)";

        //TODO: make a canvas button class
        let buttonX = a.viewport.width / 2 - 200;
        let buttonY = a.viewport.height / 2 - 30;
        let buttonWidth = 400;
        let buttonHeight = 60;

        let mouse = a.keys.mouse();

        if (mouse[0] > buttonX && mouse[0] < buttonX + buttonWidth && mouse[1] > buttonY && mouse[1] < buttonY + buttonHeight) {
            c.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
            a.drawing.drawText("Join Game", a.viewport.width / 2, a.viewport.height / 2, "30px Grobold", "rgba(250, 250, 250, 1.0)");
            if (a.keys.mouseDown()) {
                sg.clientState = se.CONNECTING;
            }
        } else {
            c.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
            a.drawing.drawText("Join Game", a.viewport.width / 2, a.viewport.height / 2, "30px Grobold", "rgba(140, 140, 140, 1.0)");
        }
    }

    /**
     * Update the connecting screen
     */
    function updateConnecting() {
        if (!sg.connecting) {
            //Tell the server to add a new player
            a.socket.addNewPlayer();
            sg.connecting = true;
        }
        let c = a.ctx;
        c.fillStyle = "white";
        c.fillRect(0, 0, a.viewport.width, a.viewport.height);
        a.drawing.drawText("Connecting...", a.viewport.width / 2, a.viewport.height / 2, "60px Grobold", "rgba(100, 100, 100, 1.0)");
    }

    /**
     * Draw the pause screen
     */
    function updatePaused() {
        let c = a.ctx;
        c.fillStyle = "rgba(0, 0, 0, 0.5)";
        c.fillRect(0, 0, a.viewport.width, a.viewport.height);
        a.drawing.drawText("Paused", a.viewport.width / 2, a.viewport.height / 2, "60px Grobold", "rgba(200, 200, 200, 1.0)");
    }

    /**
     * Draw the GUI based on server-authoritative game state
     */
    function drawGUI() {
        let c = a.ctx;

        switch (sg.gameState) {
                //Draw waiting for players GUI
            case s.e.GAME_WAITING_FOR_PLAYERS:
                a.drawing.drawTextOutline("Waiting For Players", a.viewport.width / 2, 60, "60px Grobold", "rgba(250, 250, 250, 1.0)", "rgba(0, 0, 0, 1.0)");
                break;
                //Draw game start countdown GUI
            case s.e.GAME_STARTING_SOON:
                let countdownText = "Starting in: " + Math.ceil(s.score.startCountdownLength - s.time.timers.gameStartTimer);
                a.drawing.drawTextOutline(countdownText, a.viewport.width / 2, 60, "60px Grobold", "rgba(250, 250, 250, 1.0)", "rgba(0, 0, 0, 1.0)");
                //Draw progress countdown timer
                a.drawing.drawProgressBar(a.viewport.width * (1 / 5), 120, a.viewport.width * (3 / 5), 10, "rgb(100, 100, 100)", "rgb(240, 100, 100)", s.score.startCountdownLength - s.time.timers.gameStartTimer, 0, s.score.startCountdownLength);
                break;

                //Draw game playing GUI.  SHow players, player scores, and the game timer
            case s.e.GAME_PLAYING:
                let currentSecond = Math.ceil(s.score.gameLength - s.time.timers.gameTimer);
                let timerText = "Time Left: " + currentSecond;

                //If the current second is less than the buzzer, play a sound
                if (currentSecond < s.score.lastBuzzerSecond) {
                    s.audio.sounds["countdown.wav"].start();
                    s.score.lastBuzzerSecond = currentSecond;
                }
                a.drawing.drawTextOutline(timerText, a.viewport.width / 2, 20, "20px Grobold", "rgba(250, 250, 250, 1.0)", "rgba(0, 0, 0, 1.0)", 1);
                a.drawing.drawProgressBar(a.viewport.width * (1 / 5), 40, a.viewport.width * (3 / 5), 10, "rgba(0, 0, 0, 0.1)", "rgb(240, 100, 100)", s.score.gameLength - s.time.timers.gameTimer, 0, s.score.gameLength);

                let yHeight = 80;
                //Draw players and their scores
                for (const p in sg.players) {
                    let playerName = "player " + p;
                    //Add the player's total "it" time
                    playerName += "  :  Score - " + Math.ceil(sg.players[p].attackTimer);
                    //Default font color of players
                    let fontColor = "rgba(250, 250, 250, 1.0)";
                    //Let the player know which one is them
                    if (p == sg.clientID) {
                        fontColor = "rgba(150, 150, 150, 1.0)";
                        playerName += "  :  You";
                    }
                    //Change the font color of the attacker
                    if (p == s.score.attackingPlayerID) {
                        fontColor = "rgba(250, 20, 20, 1.0)";
                    }
                    //Display this player
                    a.drawing.drawTextOutline(playerName, 30, yHeight, "30px Grobold", fontColor, "rgba(0, 0, 0, 1.0)", 1, "left");
                    //Increase the y position for the next player to be displayed
                    yHeight += 45;
                }
                break;

                //Show the game over screen
            case s.e.GAME_OVER:
                if (!s.score.playedGameEndSound) {
                    s.audio.sounds["gameOver.wav"].start();
                    s.audio.sounds["backgroundMusic.mp3"].stop();
                    s.score.playedGameEndSound = true;
                }
                let c = a.ctx;
                c.fillStyle = "rgba(0, 0, 0, 0.5)";
                c.fillRect(0, 0, a.viewport.width, a.viewport.height);
                //Draw a "Next Game Begins In" countdown timer
                let endscreenText = "Next Game Begins In: " + Math.ceil(s.score.endscreenLength - s.time.timers.gameOverTimer);
                a.drawing.drawText(endscreenText, a.viewport.width / 2, 20, "20px Grobold", "rgba(250, 250, 250, 1.0)");
                a.drawing.drawProgressBar(a.viewport.width * (1 / 5), 40, a.viewport.width * (3 / 5), 10, "rgba(0, 0, 0, 0.1)", "rgb(240, 100, 100)", s.score.endscreenLength - s.time.timers.gameOverTimer, 0, s.score.endscreenLength);

                //Display who won
                //If the client won
                if (sg.clientID == s.score.winner) {
                    a.drawing.drawText("You Win!", a.viewport.width / 2, a.viewport.height / 2, "80px Grobold", "rgba(250, 250, 250, 1.0)");
                    a.drawing.drawText("You were only attacking for " + Math.ceil(sg.players[s.score.winner].attackTimer) + " seconds", a.viewport.width / 2, a.viewport.height / 2 + 100, "30px Grobold", "rgba(200, 200, 200, 1.0)");
                    //Someone else won
                } else {
                    a.drawing.drawText("Player " + s.score.winner + " won!", a.viewport.width / 2, a.viewport.height / 2, "80px Grobold", "rgba(250, 250, 250, 1.0)");
                    a.drawing.drawText("They were only attacking for " + Math.ceil(sg.players[s.score.winner].attackTimer) + " seconds", a.viewport.width / 2, a.viewport.height / 2 + 100, "30px Grobold", "rgba(200, 200, 200, 1.0)");
                }
                break;
        }
    }

    /**
     * Called when the window resize event is fired
     */
    function resize() {
        a.viewport = a.getViewport();
        //Resize the view
        sv.active.width = a.viewport.width;
        sv.active.height = a.viewport.height;

        //Re-scale game units based on the active view
        sv.active.rescaleGU();
        //Resize the canvas to be 100vwX100vh
        a.canvas.setAttribute("width", a.viewport.width);
        a.canvas.setAttribute("height", a.viewport.height);
        //Replace the old context with the newer, resized version
        a.ctx = a.canvas.getContext('2d');
    }

    //Export everything
    return {init: init, start: start, update: update, resize: resize}
}());
