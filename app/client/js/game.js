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

        var vec = new Victor(200, 100);
        var vec1 = new Victor(100, 0);

        console.log(a.utils.lerpVec(0.5, vec, vec1));

        //Store the canvas element
        a.canvas = document.getElementById("canvas");

        //Bind resize, then call it as part of initialization
        window.addEventListener("resize", resize);
        resize();

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
        a.time.update();

        let c = a.ctx;
        c.fillStyle = "white";
        c.fillRect(0, 0, a.viewport.width, a.viewport.height);

        for (const p in sg.players) {
            c.fillStyle = "red";
            c.fillRect(sg.players[p].x - 10, sg.players[p].y - 10, 20, 20);
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
