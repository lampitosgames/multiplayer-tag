"use strict";

//Attach canvas and the drawing context to the app
app.canvas = undefined;
app.ctx = undefined;

//Image module handles drawing things on the canvas
app.image = (function() {
    //Shorthand variables
    let a = app;
    let s, sg, si, sv;
    let layers = [];

    /**
     * Initialize this module
     */
    function init() {
        //Grab shorthand state
        s = a.state;
        sg = s.game;
        si = s.image;
        sv = s.view;

        //Grab a reference to the canvas
        a.canvas = document.getElementById("canvas");

        //Loop through and load all spritesheets
        for (let i = 0; i < si.tilesheetNames.length; i++) {
            //Get the spritesheet name
            let sheetName = si.tilesheetNames[i];
            //Create a new spritesheet object with that name
            si.tilesheets[sheetName] = new a.Spritesheet('./assets/spritesheets/' + sheetName + '.json');
            //Load the spritesheet
            sg.loading.push(si.tilesheets[sheetName].load());
        }
        //Loop through and load all spritesheets
        for (let s = 0; s < si.spritesheetNames.length; s++) {
            //Get the name
            let sheetName = si.spritesheetNames[s];
            //Create a new spritesheet object with that name
            si.spritesheets[sheetName] = new a.Spritesheet('./assets/spritesheets/' + sheetName + '.json');
            //Load the spritesheet
            sg.loading.push(si.spritesheets[sheetName].load());
            si.spritesheets[sheetName].tileStart = 0;
        }
        //Loop through and load all backgrounds
        for (let b = 0; b < si.backgroundNames.length; b++) {
            //Get the background
            si.backgrounds[si.backgroundNames[b]] = new a.Background(si.backgroundNames[b]);
            //Push this background into the array of loading content
            sg.loading.push(si.backgrounds[si.backgroundNames[b]].load());
        }
        //Load the tutorial Image
        si.tutorialImg = new a.Background("tutorial.png");
        sg.loading.push(si.tutorialImg.load());

    }

    /**
     * Handle all drawing of the level
     */
    function draw() {
        let c = a.ctx;

        //Loop through every background and draw it to the canvas
        for (const bID in si.backgrounds) {
            let back = si.backgrounds[bID];

            let dx = sv.active.xMin() * back.parallaxSpeed[0];
            let dy = sv.active.yMin() * back.parallaxSpeed[1];
            let dHeight = 75 * sg.gu;
            let dWidth = dHeight * back.whRatio;
            c.drawImage(back.img, dx, dy, dWidth, dHeight);
        }

        //Loop through every layer and draw it to the canvas
        for (let l = 0; l < layers.length; l++) {
            //Loop through the data
            for (let i = 0; i < layers[l].data.length; i++) {
                let x = i % layers[l].width;;
                let y = Math.floor(i / layers[l].width);
                x *= sg.gu;
                y *= sg.gu;
                //Tile source bounds
                let tileID = layers[l].data[i];
                if (tileID == 0) {
                    continue;
                }
                let sheet = getSheet(tileID);
                if (sheet == undefined) {
                    continue;
                }
                let tile = sheet.tile(tileID);

                //Destination bounds
                let dWidth = sg.gu;
                let dHeight = sg.gu;

                if (x > sv.active.xMax() || y > sv.active.yMax() || x + dWidth < sv.active.xMin() || y + dHeight < sv.active.yMin()) {
                    continue;
                }

                let destPos = sv.active.getObjectRelativePosition({
                    x: x,
                    y: y
                }, false);

                c.drawImage(sheet.img, tile.x, tile.y, tile.width, tile.height, Math.round(destPos.x), Math.round(destPos.y), dWidth, dHeight);
            }
        }

        //Loop through every sprite and draw it
        // for (let s=0; s<)
    }

    function createTileLayer(layerData) {
        layers.push(layerData);
    }

    function getSheet(tileID) {
        for (const sid in si.tilesheets) {
            if (tileID - si.tilesheets[sid].tileStart < si.tilesheets[sid].tileCount) {
                return si.tilesheets[sid]
            }
        }
        //No sheet found
        return undefined;
    }

    return {init: init, draw: draw, createTileLayer: createTileLayer}
}());
