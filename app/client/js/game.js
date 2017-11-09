"use strict";

app.game = (function() {
    let a = app;
    let s, sg, se, st, sp, sv;

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

        //Init the main view
        sv.active = new a.view.View(0, 0, 100, 100);

        //Bind resize, then call it as part of initialization
        window.addEventListener("resize", resize);
    }

    function start() {
        //Resize the window
        resize();
        //Tell the server to add a new player
        a.socket.addNewPlayer();
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
                updateLoading();
                return;
            case se.START_SCREEN:

                break;
            case se.CONNECTING:

                break;
            case se.PLAYING:

                break;
            case se.PAUSED:

                break;
            case se.GAME_OVER:

                break;

        }

        //Update modules
        a.time.update();
        a.physics.update();
        a.playerUpdates.update();

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
    }

    function updateLoading() {
        //If there are still promises
        if (sg.loading.length > 0) {
            //Draw progress bar
            let c = a.ctx;
            c.fillStyle = "white";
            c.fillRect(0, 0, a.viewport.width, a.viewport.height);
            c.font = "48px Grobold"
            c.textAlign = "center";
            c.textBaseline = "middle";
            c.fillStyle = "red";
            c.fillText("Loading...", a.viewport.width/2, a.viewport.height/2);
            return;
        //Everything has loaded
        } else {
            //Set the state to display the start screen
            sg.state = se.TUTORIAL_SCREEN;
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

    return {
        init: init,
        start: start,
        update: update,
        resize: resize
    }
}());
