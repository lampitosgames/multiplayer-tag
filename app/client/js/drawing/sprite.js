"use strict";

/**
 * A sprite is an extension of a spritesheet.
 * They can have any number of frames animated in any order from a spritesheet
 * Since everything is pre-cahced and the frame to draw is calculated at drawtime
 * they are very efficient
 */
app.Sprite = (function() {
    function Sprite(_name, _sheet, _frameArray, _animSpeed = 0.05) {
        this.name = _name;
        this.tilesheet = _sheet;
        //Animation
        this.animSpeed = _animSpeed;
        this.frameArray = _frameArray;

        //Start a timer
        app.time.startNewTimer(this.name);

        this.draw = function(ctx, dx, dy, dWidth, dHeight) {
            let drawIndex = Math.floor(app.state.time.timers[this.name] / this.animSpeed);
            if (drawIndex > this.frameArray.length-1) {
                drawIndex = 0;
                app.time.startNewTimer(this.name);
            }
            let tile = this.tilesheet.tile(this.frameArray[drawIndex]);
            ctx.drawImage(this.tilesheet.img, tile.x, tile.y, tile.width, tile.height, dx, dy, dWidth, dHeight);
        }
    }

    return Sprite;
}());
