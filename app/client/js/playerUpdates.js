"use strict";

app.playerUpdates = (function() {
    let a = app;
    let s, sp, sg;

    function init() {
        s = a.state;
        sp = s.player;
        sg = s.game;

        //Moving left
        a.keys.keyDown("a", function() {
            if (!sp.moveLeft) {
                sp.moveLeft = true;
                sp.shouldUpdateServer = true;
            };
        });
        a.keys.keyUp("a", function() {
            if (sp.moveLeft) {
                sp.moveLeft = false;
                sp.shouldUpdateServer = true;
            }
        });
        //Moving right
        a.keys.keyDown("d", function() {
            if (!sp.moveRight) {
                sp.moveRight = true;
                sp.shouldUpdateServer = true;
            }
        });
        a.keys.keyUp("d", function() {
            if (sp.moveRight) {
                sp.moveRight = false;
                sp.shouldUpdateServer = true;
            }
        });
        //Jumping
        a.keys.keyDown("space", function() {
            if (!sp.jump) {
                sp.shouldJump = true;
                sp.shouldUpdateServer = true;
            }
        });
    }

    function update() {
        let me = sg.players[sg.clientID];
        if (me == undefined) { return; }

        me.moveLeft = sp.moveLeft;
        me.moveRight = sp.moveRight;

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
