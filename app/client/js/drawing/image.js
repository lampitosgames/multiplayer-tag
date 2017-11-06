"use strict";

app.image = (function() {
    let a = app;

    let layers = [];

    let s, sg, si;

    function init() {
        s = a.state;
        sg = s.game;
        si = s.image;

        for (let i=0; i<si.spritesheetNames.length; i++) {
            let sheetName = si.spritesheetNames[i];
            si.sheets[sheetName] = new a.Spritesheet('./assets/spritesheets/' + sheetName + '.json');
            si.sheets[sheetName].load();
        }
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
                let dx = x * sg.gu;
                let dy = y * sg.gu;
                let dWidth = sg.gu;
                let dHeight = sg.gu;

                c.drawImage(sheet.img, tile.x, tile.y, tile.width, tile.height, dx, dy, dWidth, dHeight);

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
        draw: draw,
        createTileLayer: createTileLayer
    }
}());
