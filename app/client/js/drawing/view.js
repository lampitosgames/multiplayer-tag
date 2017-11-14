"use strict";

app.view = (function() {
    let a = app;
    let s, sg, sv;
    let gu;

    function init() {
        s = a.state;
        sg = s.game;
        sv = s.view;
        gu = sg.gu;

        a.keys.keyDown("+", function() {
            sv.viewScale--;
            sv.active.rescaleGU();
        });
        a.keys.keyDown("-", function() {
            sv.viewScale++;
            sv.active.rescaleGU();
        });

        a.keys.scroll(function(dir) {
            if (dir > 0) {
                sv.viewScale -= 2;
            } else if (dir < 0) {
                sv.viewScale += 2;
            }
            sv.viewScale = a.utils.clamp(sv.viewScale, 40, 74);
            sv.active.rescaleGU();
        });
    }

    function View(_x, _y, _width, _height) {
        this.x = _x;
        this.y = _y;
        this.width = _width;
        this.height = _height;

        //How many game units fit along the largest axis of the view
        this.viewScale = 40;

        //Limits
        this.xLimitMin = 0;
        this.xLimitMax = 100;
        this.yLimitMin = 0;
        this.yLimitMax = 100;

        //Buffer
        this.xBuffer = 0.25;
        this.yBuffer = 0.25;

        this.follow = function(center) {
            //Check each axis seperately
            //If the object has moved out of the bounds of the view, move
            if (center.x > this.xMaxBuffer()) {
                //Shift right
                //Lerp the value for some delay
                let lerpFollow = a.utils.lerp(0.2, this.xMax(), center.x + this.width * this.xBuffer);
                //Set the xMax for the view
                this.xMax(lerpFollow);
            } else if (center.x < this.xMinBuffer()) {
                //Shift left
                //Lerp the value for some delay
                let lerpFollow = a.utils.lerp(0.2, this.xMin(), center.x - this.width * this.xBuffer);
                //Set the xMin for the view
                this.xMin(lerpFollow);
            }

            if (center.y > this.yMaxBuffer()) {
                //Lerp the value for some delay
                let lerpFollow = a.utils.lerp(0.4, this.yMax(), center.y + this.height * this.yBuffer);
                //Set the yMax for the view
                this.yMax(lerpFollow);
            } else if (center.y < this.yMinBuffer()) {
                //Lerp the value for some delay
                let lerpFollow = a.utils.lerp(0.4, this.yMin(), center.y - this.height * this.yBuffer);
                //Set the yMin for the view
                this.yMin(lerpFollow);
            }

        }

        this.center = function(set = undefined) {
            if (set == undefined) {
                return {
                    x: this.x + this.width / 2,
                    y: this.x + this.height / 2
                };
            } else {
                this.xMin(set.x - this.width / 2);
                this.yMin(set.y - this.height / 2);
            }
        }

        this.xMin = function(set = undefined) {
            if (set == undefined) {
                return this.x;
            } else {
                this.x = a.utils.clamp(set, this.xLimitMin, this.xLimitMax);
            }
        }
        this.xMinBuffer = function() {
            return this.xMin() + this.width * this.xBuffer;
        }
        this.xMax = function(set = undefined) {
            if (set == undefined) {
                return this.x + this.width;
            } else {
                this.x = a.utils.clamp(set, this.xLimitMin, this.xLimitMax) - this.width;
            }
        }
        this.xMaxBuffer = function() {
            return this.xMax() - this.width * this.xBuffer;
        }
        this.yMin = function(set = undefined) {
            if (set == undefined) {
                return this.y;
            } else {
                this.y = a.utils.clamp(set, this.yLimitMin, this.yLimitMax);
            }
        }
        this.yMinBuffer = function() {
            return this.yMin() + this.height * this.yBuffer;
        }
        this.yMax = function(set = undefined) {
            if (set == undefined) {
                return this.y + this.height;
            } else {
                this.y = a.utils.clamp(set, this.yLimitMin, this.yLimitMax) - this.height;
            }
        }
        this.yMaxBuffer = function() {
            return this.yMax() - this.height * this.yBuffer;
        }

        this.setLimitsPixels = function(_xMin, _xMax, _yMin, _yMax) {
            this.xLimitMin = _xMin;
            this.xLimitMax = _xMax;
            this.yLimitMin = _yMin;
            this.yLimitMax = _yMax;
        }

        this.setLimitsGU = function(_xMinGU, _xMaxGU, _yMinGU, _yMaxGU) {
            this.setLimitsPixels(
                _xMinGU * sg.gu,
                _xMaxGU * sg.gu,
                _yMinGU * sg.gu,
                _yMaxGU * sg.gu
            );
        }

        this.getObjectRelativePosition = function(obj, multiplyByGU) {
            if (obj.pos == undefined) {

                return {
                    x: obj.x*(multiplyByGU ? sg.gu : 1) - this.xMin(),
                    y: obj.y*(multiplyByGU ? sg.gu : 1) - this.yMin()
                };
            } else {
                return {
                    x: obj.pos.x*(multiplyByGU ? sg.gu : 1) - this.xMin(),
                    y: obj.pos.y*(multiplyByGU ? sg.gu : 1) - this.yMin()
                }
            }
        }

        this.rescaleGU = function() {
            sg.gu = Math.round(Math.max(this.width, this.height) / sv.viewScale);
            //Re-define position limits for the view
            sv.active.setLimitsGU(0, 75, 0, 75);
            //Make sure they didn't zoom out past the world border
            sv.active.xMin(sv.active.xMin());
            sv.active.xMax(sv.active.xMax());
            sv.active.yMin(sv.active.yMin());
            sv.active.yMax(sv.active.yMax());
        }
    }
    return {
        init: init,
        View: View
    }
}());
