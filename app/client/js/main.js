"use strict";

app.canvas = undefined;
app.ctx = undefined;

app.main = (function() {
    let a = app;
    let s, sm, sc, se, st, sl;

    /**
     * Initialization
     */
    function init() {
        //Shorthand state
        s = a.state;
        sm = s.main;
        sc = s.colors;
        se = s.e;
        st = s.time;
        sl = s.levels;

        //Store the canvas element
        a.canvas = document.getElementById("canvas");
        //Set initial game state
        sm.gameState = se.BEGIN;

        //Create a cursor
        sm.cursor = new Cursor(40, "rgba(255, 255, 255, 0.75)", 5);

        //Bind mousedown
        a.canvas.onmousedown = mouseDown;

        //Bind resize, then call it as part of initialization
        window.addEventListener("resize", resize);
        resize();

        //Reset the level
        reset();
        //Start the update loop
        update();
    }

    /**
     * Main update loop of the game
     */
    function update() {
        //Start the animation loop
        sm.animationID = requestAnimationFrame(update);

        //Update the timer
        if (a.keys.pressed("t")) {
            sm.dtMultiplier = 6;
        } else {
            sm.dtMultiplier = 1;
        }
        a.time.update();

        //Override everything with a full size background
        a.ctx.fillStyle = "#171717";
        a.ctx.fillRect(0, 0, a.viewport.width, a.viewport.height);

        //Draw all particles
        for (var i=0; i<sm.particles.length; i++) { sm.particles[i].draw(); }
        //Draw all explosions
        for (var i=0; i<sm.explosions.length; i++) { sm.explosions[i].draw(a.time.dt()); }
        //Draw the game HUD
        drawHUD();

        //If in debug mode, draw debugger things
        if (sm.debug) {
            a.ctx.textAlign = "left";
            //Draw delta time
            a.utils.fillText("dt: " + a.time.dt().toFixed(3), a.viewport.width - 150, a.viewport.height - 10, "10pt courier", "white");
        }

        //Pause check
        if (sm.paused) {
            drawPauseScreen();
            return;
        }
        /*UPDATES DON'T HAPPEN IF GAME IS PAUSED*/
        //Update all particles
        for (var i=0; i<sm.particles.length; i++) { sm.particles[i].update(a.time.dt()); }
        //Update all explosions
        for (var i=0; i<sm.explosions.length; i++) { sm.explosions[i].update(a.time.dt()); }

        //If the round is over (exploding has happened and all explosions have finished)
        if (sm.gameState == se.EXPLODING && sm.explosions.length == 0) {
            //If they didn't get enough points, fail the level
            if (sm.roundScore < sl[sm.currentLevel].targetNum) {
                sm.gameState = se.REPEAT_LEVEL;
            //If they aren't repeating the level
            } else {
                //End this round
                sm.gameState = se.ROUND_OVER;
                //Increase total score
                sm.totalScore += sm.roundScore;
            }

            //If they didn't fail the last level and it was the final level, end the game
            if (sm.gameState != se.REPEAT_LEVEL && sm.currentLevel == sl.length-1) {
                sm.gameState = se.END;
            }

            //Stop the background song
            a.audio.stopBGAudio();
        }

        //If the round isn't over and the game isn't exploding, update and draw the cursor
        if (sm.gameState != se.ROUND_OVER && sm.gameState != se.END && sm.gameState != se.REPEAT_LEVEL && sm.gameState != se.EXPLODING) {
            sm.cursor.update();
            sm.cursor.draw();
        }
        //CHECK FOR CHEATS
        if (sm.gameState == se.BEGIN || sm.gameState == se.ROUND_OVER || sm.gameState == se.REPEAT_LEVEL || sm.gameState == se.END) {
            //If keys are down
            if (a.keys.pressed("up") && a.keys.pressed("shift")) {
                sm.totalScore++;
                a.audio.playEffect();
            }
        }
    }

    /**
     * Resets the game and moves to the next level
     */
    function reset() {
        //Determine game state
        if (sm.gameState == se.BEGIN) {
            sm.gameState = se.BEGIN;
        } else {
            sm.gameState = se.DEFAULT;
        }
        //Increment the current level
        sm.currentLevel += 1;
        //Get the number of circles for this level
        sm.numCircles = sl[sm.currentLevel].numCircles;
        //Reset the round score
        sm.roundScore = 0;
        //Init particles
        sm.particles = [];
        sm.explosions = [];
        //Create circles
        makeCircles(sm.numCircles);
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

    /**
     * MouseDown handler for canvas
     */
    function mouseDown() {
        //start music
        a.audio.startBGAudio();

        //If the game was paused, unpause and do nothing
        if (sm.paused) {
            sm.paused = false;
            update();
            return;
        }
        //If the game is already in the exploding state, do nothing
        if (sm.gameState == se.EXPLODING) {
            return;
        }
        //if the round is over, start the next round
        if (sm.gameState == se.ROUND_OVER) {
            reset();
            return;
        }
        //If the round is over and it failed, restart the current round
        if (sm.gameState == se.REPEAT_LEVEL) {
            sm.currentLevel--;
            reset();
            return;
        }
        //If the game is over
        if (sm.gameState == se.END) {
            //Restart the game
            sm.currentLevel = -1;
            sm.gameState = se.BEGIN;
            sm.totalScore = 0;
            reset();
            return;
        }
        //If none of the above returned, call the cursor's click event
        sm.cursor.click();
    }

    /**
     * Create a number of circle objects with random colors, randomly placed, and going in random directions
     */
    function makeCircles(count) {
        for (var i=0; i<count; i++) {
            let radius = se.START_RADIUS;
            let speed = se.MAX_SPEED;
            sm.particles.push(new Circle(a.utils.randomInt(radius*2, a.viewport.width-radius*2),
                                         a.utils.randomInt(radius*2, a.viewport.height-radius*2),
                                         radius,
                                         sc[i % (sc.length-1)]
                                        ));
            let circleVec = a.utils.randomVec();
            sm.particles[i].setVel(circleVec[0]*speed, circleVec[1]*speed);
        }
    }

    /**
     * Sets the pause state based on a boolean.
     * Plays/pauses audio accordingly
     */
    function togglePause(value) {
        sm.paused = value;
        if (value) {
            a.audio.stopBGAudio();
        } else {
            a.audio.startBGAudio();
        }
        cancelAnimationFrame(sm.animationID);
        update();
    }

    /**
     * Sets the debug state based on a boolean.
     */
    function toggleDebug(value) {
        sm.debug = value;
    }

    /**
     * Draws text on the screen based on the game state
     */
    function drawHUD() {
        let c = a.ctx;
        c.save();
        //Draw Score
        a.utils.fillText("Level " + (sm.currentLevel+1) + ": " + sm.roundScore + "/" + sl[sm.currentLevel].targetNum + " of " + sm.numCircles, 20, 20, "14pt courier", "#dddddd");
        a.utils.fillText("Total Score: " + sm.totalScore, a.viewport.width - 200, 20, "14pt courier", "#dddddd");

        c.textAlign = "center";
        c.textBaseline = "middle";

        //Draw tutorial text
        if (sm.gameState == se.BEGIN) {
            a.utils.fillText("To begin, click a circle", a.viewport.width/2, a.viewport.height/2, "30pt courier", "#FFFFFF");
        }

        //Draw round over text
        if (sm.gameState == se.ROUND_OVER) {
            a.utils.fillText(sl[sm.currentLevel].winMessage, a.viewport.width/2, a.viewport.height/2 - 40, "30pt courier", "white");
            a.utils.fillText("Click to continue", a.viewport.width/2, a.viewport.height/2, "30pt courier", "red");
            a.utils.fillText("Goal next round: " + sl[sm.currentLevel+1].targetNum + " of " + sl[sm.currentLevel+1].numCircles + " circles",
                               a.viewport.width/2,
                               a.viewport.height/2 + 40,
                               "30pt courier", "white"
                           );
        }

        //Draw round repeat text
        if (sm.gameState == se.REPEAT_LEVEL) {
            a.utils.fillText(sl[sm.currentLevel].failMessage, a.viewport.width/2, a.viewport.height/2 - 80, "30pt courier", "white");
            a.utils.fillText("You missed the goal of " + sl[sm.currentLevel].targetNum + " circles", a.viewport.width/2, a.viewport.height/2 - 40, "30pt courier", "white");
            a.utils.fillText("Click to continue", a.viewport.width/2, a.viewport.height/2, "30pt courier", "red");
            a.utils.fillText("Goal: " + sl[sm.currentLevel].targetNum + " of " + sl[sm.currentLevel].numCircles + " circles",
                               a.viewport.width/2,
                               a.viewport.height/2 + 40,
                               "30pt courier", "white"
                           );
        }

        //Draw game over text
        if (sm.gameState == se.END) {
            a.utils.fillText(sl[sm.currentLevel].winMessage, a.viewport.width/2, a.viewport.height/2 - 70, "60pt courier", "#FFFFFF");
            a.utils.fillText("Your final score was " + sm.totalScore, a.viewport.width/2, a.viewport.height/2, "30pt courier", "red");
            a.utils.fillText("Click to play again", a.viewport.width/2, a.viewport.height/2 + 60, "20pt courier", "#FFFFFF");
        }

        c.restore();
    }

    /**
     * Draw the pause text overlay
     */
    function drawPauseScreen() {
        let c = a.ctx;
        c.save();
        c.fillStyle = "rgba(0, 0, 0, 0.5)";
        c.fillRect(0, 0, a.viewport.width, a.viewport.height);
        c.textAlign = "center";
        c.textBaseline = "middle";
        a.utils.fillText("... PAUSED ...", a.viewport.width/2, a.viewport.height/2, "40pt courier", "#FFFFFF");
        c.restore();
    }

    return {
        init: init,
        update: update,
        resize: resize,
        reset: reset,
        togglePause: togglePause,
        toggleDebug: toggleDebug,
        makeCircles: makeCircles
    }
}());
