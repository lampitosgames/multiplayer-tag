"use strict";

//Module that exports drawing utilities
app.drawing = (function() {
    let a = app;

    function drawShadowText(string, x, y, css, shadowColor, textColor, offsetX = 5, offsetY = 5, textAlign = "center", textBaseline = "middle") {
        //Draw shadow
        drawText(string, x + offsetX, y + offsetY, css, shadowColor, textAlign, textBaseline);
        //Draw text
        drawText(string, x, y, css, textColor, textAlign, textBaseline);
    }

    function drawText(string, x, y, css, color, textAlign = "center", textBaseline = "middle") {
        let c = a.ctx;
        c.save();
        c.font = css;
        c.fillStyle = color;
        c.textAlign = textAlign;
        c.textBaseline = textBaseline;
        c.fillText(string, x, y);
        c.restore();
    }

    function drawTextOutline(string, x, y, css, color, outlineColor, lineWidth = 3, textAlign = "center", textBaseline = "middle") {
        let c = a.ctx;
        c.save();
        c.font = css;
        c.fillStyle = color;
        c.strokeStyle = outlineColor;
        c.lineWidth = lineWidth;
        c.textAlign = textAlign;
        c.textBaseline = textBaseline;
        c.fillText(string, x, y);
        c.strokeText(string, x, y);
        c.restore();
    }

    function drawProgressBar(x, y, width, height, backColor, frontColor, val, minVal, maxVal) {
        let c = a.ctx;
        c.save();
        c.fillStyle = backColor;
        c.fillRect(x, y, width, height);
        c.fillStyle = frontColor;
        let frontWidth = a.utils.map(val, minVal, maxVal, 0, width);
        c.fillRect(x, y, frontWidth, height);
        c.restore();
    }

    return {
        drawShadowText: drawShadowText,
        drawText: drawText,
        drawTextOutline: drawTextOutline,
        drawProgressBar: drawProgressBar
    }
}());
