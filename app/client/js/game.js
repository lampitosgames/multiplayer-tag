"use strict";

app.game = (function() {
    let a = app;
    let s, sg, se, st, sp, sv, si;

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

        //switch based on game state
        switch (sg.state) {
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
            case se.GAME_OVER:

                break;
            //The default.  Update as normal
            case se.PLAYING:
                //Play background music
                if (!s.audio.sounds["backgroundMusic.mp3"].playing) {
                    s.audio.sounds["backgroundMusic.mp3"].start();
                    s.audio.sounds["backgroundMusic.mp3"].gain.gain.value = s.e.MUSIC_VOLUME;
                }
                break;

        }

        //Update modules
        a.time.update();
        a.physics.update();
        a.playerUpdates.update();
        a.audio.update();

        //Re-draw the background
        let c = a.ctx;
        c.fillStyle = "white";
        c.fillRect(0, 0, a.viewport.width, a.viewport.height);

        a.image.draw();

        //Draw all players
        for (const p in sg.players) {
            let player = sg.players[p];
            player.update();
            c.fillStyle = "red";
            if (sg.players[p].attacking) {
                c.fillStyle = "blue";
            }
            let relativePos = sv.active.getObjectRelativePosition(player.gameObject, true);
            c.fillRect(relativePos.x, relativePos.y, player.gameObject.width * sg.gu, player.gameObject.height * sg.gu);
        }

        //Move the view to the client player
        if (sg.players[sg.clientID] != undefined) {
            sv.active.follow(sg.players[sg.clientID].gameObject.center().clone().multiplyScalar(sg.gu));
        }

        //If the game is paused, draw the pause pause screen
        if (sg.state == se.PAUSED) {
            updatePaused();
        }
    }

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
            sg.state = se.TUTORIAL_SCREEN;
        }
    }

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
            dWidth = a.viewport.width > a.viewport.height ? a.viewport.height : a.viewport.width;
            dHeight = dWidth;
        }
        //Center the image
        let dx = (a.viewport.width / 2) - (dWidth / 2);
        let dy = (a.viewport.height / 2) - (dHeight / 2);

        //Draw the image
        c.drawImage(img.img, dx, dy, dWidth, dHeight);

        //If the user clicks, go to the start screen
        if (a.keys.mouseDown()) {
            sg.state = se.START_SCREEN;
        }
    }

    function updateStartScreen() {
        let c = a.ctx;
        c.fillStyle = "white";
        c.fillRect(0, 0, a.viewport.width, a.viewport.height);
        a.drawing.drawText("This is a temporary title", a.viewport.width / 2, a.viewport.height / 3, "48px Grobold", "rgba(100, 100, 100, 1.0)");


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
                sg.state = se.CONNECTING;
            }
        } else {
            c.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
            a.drawing.drawText("Join Game", a.viewport.width / 2, a.viewport.height / 2, "30px Grobold", "rgba(140, 140, 140, 1.0)");
        }
    }

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

    function updatePaused() {
        let c = a.ctx;
        c.fillStyle = "rgba(0, 0, 0, 0.5)";
        c.fillRect(0, 0, a.viewport.width, a.viewport.height);
        a.drawing.drawText("Paused", a.viewport.width / 2, a.viewport.height / 2, "60px Grobold", "rgba(200, 200, 200, 1.0)");
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

    return {
        init: init,
        start: start,
        update: update,
        resize: resize
    }
}());
