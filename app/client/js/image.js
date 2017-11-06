"use strict";

app.image = (function() {
    let a = app;

    let spritesheet = {
        img: undefined,
        ready: false,
        name: undefined,
        tileWidth: undefined,
        tileHeight: undefined,
        spacing: undefined,
        tileCount: undefined,
        columns: undefined
    };

    let layers = [];

    let s, sg;

    function init() {
        s = a.state;
        sg = s.game;

        //get spritesheet JSON metadata
        let request = new XMLHttpRequest();
        request.open('GET', './assets/spritesheets/core_spritesheet.json');
        request.responseType = 'json';
        request.onload = function () {
            let sheetData = request.response;
            spritesheet.name = sheetData.name;
            spritesheet.tileWidth = sheetData.tileWidth;
            spritesheet.tileHeight = sheetData.tileHeight;
            spritesheet.spacing = sheetData.spacing;
            spritesheet.tileCount = sheetData.tileCount;
            spritesheet.columns = sheetData.columns;

            spritesheet.img = new Image();
            spritesheet.img.onload = function() {
                spritesheet.ready = true;
            }
            spritesheet.img.src = sheetData.spritesheet;
        }
        request.send();
    }

    function draw() {
        //If the spritesheet hasn't loaded, do nothing
        if (!spritesheet.ready) {
            return;
        }
        //Loop through every layer and draw it to the canvas
        let c = a.ctx;

        //TODO: Do tilesheet calculations once and cache them

        for (let l = 0; l<layers.length; l++) {
            //Loop through the data
            for (let i = 0; i<layers[l].data.length; i++) {
                let x = i % layers[l].width;;
                let y = Math.floor(i / layers[l].width);

                //Tile source bounds
                let tileID = layers[l].data[i] - 1;
                if (tileID == -1) {
                    continue;
                }
                let sx = tileID % (spritesheet.columns);
                let sy = Math.floor(tileID / (spritesheet.columns-1)) - 1;
                sx = sx * spritesheet.tileWidth + spritesheet.spacing * sx;
                sy = sy * spritesheet.tileHeight + spritesheet.spacing * sy;
                let sWidth = spritesheet.tileWidth;
                let sHeight = spritesheet.tileHeight;

                //Destination bounds
                let dx = x * sg.gu;
                let dy = y * sg.gu;
                let dWidth = sg.gu;
                let dHeight = sg.gu;

                c.drawImage(spritesheet.img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

            }
        }
    }

    function createTileLayer(layerData) {
        layers.push(layerData);
    }

    return {
        init: init,
        draw: draw,
        createTileLayer: createTileLayer
    }
}());
