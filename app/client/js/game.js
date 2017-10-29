"use strict";

app.canvas = undefined;
app.ctx = undefined;

app.game = (function() {
    let a = app;
    let s, sg, se, st;

    /**
     * Initialization
     */
    function init() {
        //Shorthand state
        s = a.state;
        sg = s.game;
        se = s.e;
        st = s.time;

        //Store the canvas element
        a.canvas = document.getElementById("canvas");

        //Bind resize, then call it as part of initialization
        window.addEventListener("resize", resize);
        resize();

        //Tell the server to add a new player
        a.socket.addNewPlayer();

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

        //Re-draw the background
        let c = a.ctx;
        c.fillStyle = "white";
        c.fillRect(0, 0, a.viewport.width, a.viewport.height);

        //Calculate current velocity
        let vel = new Victor(0, 0);
        if (a.keys.pressed('w')) {
            vel.y -= 50;
        }
        if (a.keys.pressed('a')) {
            vel.x -= 50;
        }
        if (a.keys.pressed('s')) {
            vel.y += 50;
        }
        if (a.keys.pressed('d')) {
            vel.x += 50;
        }
        updateOwnVel(vel);

        //Update and draw all players
        for (const p in sg.players) {
            sg.players[p].update();
            c.fillStyle = "red";
            c.fillRect(sg.players[p].pos.x - 10, sg.players[p].pos.y - 10, 20, 20);
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
        if (newVel.x != me.vel.x || newVel.y != me.vel.y) {
            //Update it and tell the server
            me.vel = newVel;
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
        update: update,
        resize: resize
    }
}());
