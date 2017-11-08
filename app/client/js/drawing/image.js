"use strict";

app.canvas = undefined;
app.bufferCanvas = undefined;
app.ctx = undefined;
app.bufferCtx = undefined;

app.image = (function() {
    let a = app;

    let layers = [];

    let s, sg, si, sv;

    function init() {
        s = a.state;
        sg = s.game;
        si = s.image;
        sv = s.view;

        //Create two canvases
        a.canvas = document.getElementById("canvas");
        a.bufferCanvas = document.createElement("canvas");
        console.dir(a.bufferCanvas);

        for (let i=0; i<si.spritesheetNames.length; i++) {
            let sheetName = si.spritesheetNames[i];
            si.sheets[sheetName] = new a.Spritesheet('./assets/spritesheets/' + sheetName + '.json');
            si.sheets[sheetName].load();
        }
    }

    function swapBuffer() {
        a.ctx.drawImage(a.bufferCanvas, 0, 0, a.viewport.width, a.viewport.height);
    }

    function draw() {
        //If the spritesheet hasn't loaded, do nothing
        if (!si.sheets["core_spritesheet"].ready || !si.sheets["winter_spritesheet"].ready) {
            return;
        }
        //Loop through every layer and draw it to the canvas
        let c = a.ctx;

        for (let l = 0; l<layers.length; l++) {
            //Loop through the data
            for (let i = 0; i<layers[l].data.length; i++) {
                let x = i % layers[l].width;;
                let y = Math.floor(i / layers[l].width);

                //Tile source bounds
                let tileID = layers[l].data[i];
                if (tileID == 0) { continue; }
                let sheet = getSheet(tileID);
                if (sheet == undefined) { continue; }
                let tile = sheet.tile(tileID);

                //Destination bounds
                let destPos = sv.active.getObjectRelativePosition({x: x, y: y});
                let dWidth = sg.gu;
                let dHeight = sg.gu;

                c.drawImage(sheet.img, tile.x, tile.y, tile.width, tile.height, Math.round(destPos.x), Math.round(destPos.y), dWidth, dHeight);

            }
        }
    }

    function createTileLayer(layerData) {
        layers.push(layerData);
    }

    function getSheet(tileID) {
        for (const sid in si.sheets) {
            if (tileID - si.sheets[sid].tileStart < si.sheets[sid].tileCount) {
                return si.sheets[sid]
            }
        }
        //No sheet found
        return undefined;
    }

    return {
        init: init,
        swapBuffer: swapBuffer,
        draw: draw,
        createTileLayer: createTileLayer
    }
}());
