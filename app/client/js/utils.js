"use strict";

app.utils = {
	//normalize function (find where the 'value' falls percentage-wise between the min and max)
	norm: function(value, min, max) {
		return (value - min) / (max - min);
	},
	//linear interpolation function (find the value from a min and max value, and a normalized number) ((max-min) * norm + min)
	lerp: function(norm, min, max) {
		return (max - min) * norm + min;
	},
	//Map funciton that gets the normalized value of a number in one range, and returns the interpolated value in a second range
	map: function(value, sourceMin, sourceMax, destMin, destMax) {
		var n = this.norm(value, sourceMin, sourceMax);
		return this.lerp(n, destMin, destMax);
	},
	//Clamp.  Make sure a value stays between two values in a range
	clamp: function(value, min, max) {
		return Math.min(Math.max(value, Math.min(min, max)), Math.max(min, max));
	},
	//convert degrees to radians
	inRads: function(degr) {
		return degr / 180 * Math.PI;
	},
	//convert radians to degrees
	inDegr: function(rads) {
		return rads * 180 / Math.PI;
	},
	//detect if a value is within a range
	inRange: function(value, min, max) {
		return value >= Math.min(min, max) && value <= Math.max(min, max);
	},
	//detect if two ranges overlap
	rangeIntersect: function(min0, max0, min1, max1) {
		return Math.max(min0, max0) >= Math.min(min1, max1) &&
			   Math.min(min0, max0) <= Math.min(min1, max1);
	},
	//detect if one range is fully in another range
	rangeContains: function(min0, max0, min1, max1) {
		return Math.max(min0, max0) >= Math.max(min1, max1) &&
			   Math.min(min0, max0) <= Math.min(min1, max1);
	},
	//random number within a range
	randomRange: function(min, max) {
		return min + Math.random() * (max - min);
	},
	//random integer within a range
	randomInt: function(min, max) {
		return Math.floor(min + Math.random() * (max - min + 1));
	},
    //random unit vector
    randomVec: function() {
        let vec = [this.randomRange(-1, 1), this.randomRange(-1, 1)];
        let len = Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1]);
        if (len == 0) { vec = [1,0]; len=1; }
        return [vec[0]/len, vec[1]/len];
    },
    //random rgb color
    randomRGB: function() {
        return "rgb(" + this.randomInt(0, 255) + "," + this.randomInt(0, 255) + "," + this.randomInt(0, 255) + ")";
    },
    //random rgba color
    randomRGBA: function() {
        return "rgba(" + this.randomInt(0, 255) + "," + this.randomInt(0, 255) + "," + this.randomInt(0, 255) + "," + this.randomRange(0.0, 1.0) + ")";
    },
    //random rgb color with fixed opacity
    randomRGBOpacity: function(opacity) {
        return "rgba(" + this.randomInt(0, 255) + "," + this.randomInt(0, 255) + "," + this.randomInt(0, 255) + "," + this.clamp(opacity, 0.0, 1.0) + ")";
    },

    //Collision Detection

    /**
     * Check for a particle colliding with the edge
     */
    checkBoundingCollision: function(item) {
        //Grab the current bounds of the screen
        let bounds = app.viewport;
        //Detect edge collision horizontally
        if (item.x + item.radius > bounds.width && item.velx > 0) { item.velx *= -1; }
        if (item.x - item.radius < 0 && item.velx < 0) { item.velx *= -1; }
        //Detect edge collision vertically
        if (item.y + item.radius > bounds.height && item.vely > 0) { item.vely *= -1; }
        if (item.y - item.radius < 0 && item.vely < 0) { item.vely *= -1; }
    },

    /**
     * Circle on circle collision
     * returns bool : are circles colliding
     */
    circleCollision: function(c1, c2) {
        let xDiff = Math.abs(c2.x-c1.x), yDiff = Math.abs(c2.y-c1.y);
        let dist = Math.sqrt(xDiff*xDiff + yDiff*yDiff);
        return dist < c1.radius + c2.radius;
    },

    //Drawing
    /**
     * Write text with given parameters.
     * From: Boomshine-ICE-start
     */
    fillText: function(string, x, y, css, color) {
        let c = app.ctx;
        c.save();
        c.font = css;
        c.fillStyle = color;
        c.fillText(string, x, y);
        c.restore();
    },
    /**
     * Fill a circle
     */
    fillCircle: function(x, y, radius, fillColor) {
        let c = app.ctx;
        c.save();
        c.fillStyle = fillColor;
        c.beginPath();
        c.arc(x, y, radius, 0, Math.PI*2);
        c.fill();
        c.globalAlpha = 1.0;
        c.restore();
    },
    /**
     * Stroke a Circle
     * this sounds a little dirty 0_0
     */
    strokeCircle: function(x, y, radius, strokeColor, lineWidth) {
        let c = app.ctx;
        c.save();
        c.beginPath();
        c.strokeStyle = strokeColor;
        c.lineWidth = lineWidth;
        c.arc(x, y, radius, 0, Math.PI*2);
        c.stroke();
        c.restore();
    },
}

/**
 * Get a cross-browser viewport object with related size data
 */
app.getViewport = function() {
    var ele = window, pre = 'inner';
    if (!('innerWidth' in window)) {
        pre = 'client';
        ele = document.documentElement || document.body;
    }
             //Width of window
    return { width: ele[pre + 'Width'],
             //Height of window
             height: ele[pre + 'Height'],
             //View width css unit
             vw: ele[pre + 'Width']/100.0,
             //View Height css unit
             vh: ele[pre + 'Height']/100.0 };
}

app.getMouse = function(e) {
    return [e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop];
}
