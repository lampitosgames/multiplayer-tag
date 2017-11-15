"use strict";

/**
 * The playerUpdates module is ued to detect client input and determine when to update the server
 */
app.playerUpdates = (function() {
    let a = app;
    let s,
        sp,
        sg;

    /**
     * Initialize the module and bind keys
     */
    function init() {
        //Shorthand state
        s = a.state;
        sp = s.player;
        sg = s.game;

        //Moving left
        a.keys.keyDown("a", "left", function() {
            if (!sp.moveLeft) {
                sp.moveLeft = true;
                sp.shouldUpdateServer = true;
            };
        });
        a.keys.keyUp("a", "left", function() {
            if (sp.moveLeft) {
                sp.moveLeft = false;
                sp.shouldUpdateServer = true;
            }
        });

        //Moving right
        a.keys.keyDown("d", "right", function() {
            if (!sp.moveRight) {
                sp.moveRight = true;
                sp.shouldUpdateServer = true;
            }
        });
        a.keys.keyUp("d", "right", function() {
            if (sp.moveRight) {
                sp.moveRight = false;
                sp.shouldUpdateServer = true;
            }
        });

        //Jumping
        a.keys.keyDown("space", "w", "up", function() {
            if (!sp.shouldJump) {
                sp.shouldJump = true;
                sp.shouldUpdateServer = true;
            }
        });

        //Sprinting
        a.keys.keyDown("shift", function() {
            if (sg.players[sg.clientID].gameObject.jump < 1 && !sp.sprint) {
                sp.sprint = true;
                sp.shouldUpdateServer = true;
            }
        });
        a.keys.keyUp("shift", function() {
            if (sp.sprint) {
                sp.sprint = false;
                sp.shouldUpdateServer = true;
            }
        });

        //Drop downs
        a.keys.keyDown("s", "down", function() {
            if (!sp.dropDown) {
                sp.dropDown = true;
                sp.shouldUpdateServer = true;
            }
        });
        a.keys.keyUp("s", "down", function() {
            if (sp.dropDown) {
                sp.dropDown = false;
                sp.shouldUpdateServer = true;
            }
        });

        //Pause screen
        a.keys.keyUp("p", "esc", function() {
            if (sg.clientState == s.e.PLAYING) {
                sg.clientState = s.e.PAUSED;
            } else if (sg.clientState == s.e.PAUSED) {
                sg.clientState = s.e.PLAYING;
            }
        });

        //Mute music (buggy.  Only turns it off until the audio loops or the game restarts)
        a.keys.keyUp("m", function() {
            s.audio.sounds["backgroundMusic.mp3"].gain.gain.value = 0.0;
        });
    }

    /**
     * Update the player updates module
     */
    function update() {
        //Grab the client player
        let me = sg.players[sg.clientID];
        //If the client doesn't have a player yet, return
        if (me == undefined) {
            return;
        }

        //Update movement state of the client based on input that happened since the last frame
        me.moveLeft = sp.moveLeft;
        me.moveRight = sp.moveRight;
        me.sprint = sp.sprint;
        me.gameObject.drop = sp.dropDown;

        //If the player can jump
        if (me.gameObject.jump < 2) {
            //Update jump logic
            me.shouldJump = sp.shouldJump;
            //If a new jump is detected, play the jump sound
            if (sp.shouldJump) {
                s.audio.sounds["jump.wav"].start();
            }
        }
        //If the client should update the server (new inputs)
        if (sp.shouldUpdateServer) {
            //Update the server and set the shouldUpdate to false
            a.socket.updateClientPlayer();
            sp.shouldUpdateServer = false;
        }
        //Always reset shouldJump
        sp.shouldJump = false;
    }

    //Export everything
    return {init: init, update: update}
}());
