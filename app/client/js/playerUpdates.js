"use strict";

app.playerUpdates = (function() {
    let a = app;
    let s, sp, sg;

    function init() {
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
            if (sg.state == s.e.PLAYING) {
                sg.state = s.e.PAUSED;
            } else if (sg.state == s.e.PAUSED) {
                sg.state = s.e.PLAYING;
            }
        })
    }

    function update() {
        let me = sg.players[sg.clientID];
        if (me == undefined) { return; }

        me.moveLeft = sp.moveLeft;
        me.moveRight = sp.moveRight;
        me.sprint = sp.sprint;
        me.gameObject.drop = sp.dropDown;

        if (me.gameObject.jump < 2) {
            me.shouldJump = sp.shouldJump;
        }

        if (sp.shouldUpdateServer) {
            a.socket.updateClientPlayer();
            sp.shouldUpdateServer = false;
        }

        sp.shouldJump = false;
    }

    return {
        init: init,
        update: update
    }
}());
