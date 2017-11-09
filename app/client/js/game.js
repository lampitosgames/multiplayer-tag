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

        //Lastly, swap in the buffer canvas
        // a.image.swapBuffer();
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
        //Resize the buffer canvas
        a.bufferCanvas.setAttribute("width", a.viewport.width);
        a.bufferCanvas.setAttribute("height", a.viewport.height);
        //Replace the old context with the newer, resized version
        a.ctx = a.canvas.getContext('2d');
        //Replace the old buffer context
        a.bufferCtx = a.bufferCanvas.getContext('2d');
    }

    return {
        init: init,
        start: start,
        update: update,
        resize: resize
    }
}());
