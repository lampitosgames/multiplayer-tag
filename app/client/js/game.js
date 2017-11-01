"use strict";

app.canvas = undefined;
app.ctx = undefined;

app.game = (function() {
    let a = app;
    let s, sg, se, st, sp;

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

        //Store the canvas element
        a.canvas = document.getElementById("canvas");

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

        a.keys.keyDown("space", function() {
            let me = sg.players[sg.clientID];
            me.gameObject.vel.y -= 18;
            a.socket.updateClientPlayer();
        });

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

        //Re-draw the background
        let c = a.ctx;
        c.fillStyle = "white";
        c.fillRect(0, 0, a.viewport.width, a.viewport.height);

        //Calculate current velocity
        let vel = new Victor(0, 0);
        if (a.keys.pressed('a')) {
            vel.x -= 5;
        }
        if (a.keys.pressed('d')) {
            vel.x += 5;
        }
        updateOwnVel(vel);

        //Update and draw all players
        for (const p in sg.players) {
            let player = sg.players[p];
            player.update();
            c.fillStyle = "red";
            c.fillRect(player.gameObject.pos.x * sg.gu, player.gameObject.pos.y * sg.gu, player.gameObject.width * sg.gu, player.gameObject.height * sg.gu);
        }

        for (let i=0; i<sp.platforms.length; i++) {
            let col = sp.platforms[i];
            c.fillRect(col.xMin() * sg.gu, col.yMin() * sg.gu, col.width * sg.gu, col.height * sg.gu);
        }
    }

    function testing() {
        let c = a.ctx;
        for (let i=0; i<s.physics.rigidBodies.length; i++) {
            let body = s.physics.rigidBodies[i].col;
            c.strokeStyle = "red";
            c.lineWidth = 2;
            c.strokeRect(body.pos.x * sg.gu, body.pos.y * sg.gu, body.width * sg.gu, body.height * sg.gu);
        }
    }

    /**
     * If velocity has changed, update it and tell the server
     */
    function updateOwnVel(newVel) {
        //Get the client's player object
        let me = sg.players[sg.clientID];
        //Ensure the player has been created
        if (typeof(me) == 'undefined') { return; }
        //If the velocity changed
        if (newVel.x != me.gameObject.vel.x || newVel.y != me.gameObject.vel.y) {
            //Update it and tell the server
            me.gameObject.vel.x = newVel.x;
            a.socket.updateClientPlayer();
        }
    }

    /**
     * Called when the window resize event is fired
     */
    function resize() {
        a.viewport = a.getViewport();
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
