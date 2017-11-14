"use strict";

app.Spritesheet = (function() {
    function Spritesheet(jsonFilepath) {
        //Is the spritesheet ready?
        this.ready = false;
        this.img = undefined;
        this.name = "";
        this.tileWidth = 0;
        this.tileHeight = 0;
        this.spacing = 0;
        this.tileCount = 0;
        this.columns = 0;

        //Sprite data (if any) from this sheet
        this.sprites = undefined;

        //This will be used as the starting index for tiles in this sheet.
        this.tileStart;

        //Cached data about tiles
        this.tiles = {};

        this.load = function() {
            let sheet = this;
            //Return a promise that resolves once the spritesheet has been fully loaded
            return new Promise(function(resolve, reject) {
                try {
                    let request = new XMLHttpRequest();
                    request.open('GET', jsonFilepath);
                    request.responseType = 'json';
                    request.onload = function() {
                        let sheetData = request.response;
                        //Store sheet data in the object
                        sheet.name = sheetData.name;
                        sheet.tileWidth = sheetData.tileWidth;
                        sheet.tileHeight = sheetData.tileHeight;
                        sheet.spacing = sheetData.spacing;
                        sheet.tileCount = sheetData.tileCount;
                        sheet.columns = sheetData.columns;

                        if (sheetData.sprites) {
                            sheet.sprites = sheetData.sprites;
                        }

                        //Load the Image
                        sheet.img = new Image();
                        sheet.img.onload = function() {
                            //Set the sheet to ready
                            sheet.ready = true;
                            //Pre-cache tile coordinates
                            sheet.cacheTiles();
                            sheet.makeSprites();
                            //Resolve the promise once loaded
                            resolve(sheet);
                        }
                        sheet.img.src = sheetData.spritesheet;
                    }
                    request.send();
                } catch (error) {
                    reject(error);
                }
            });
        }

        this.cacheTiles = function() {
            //Loop through the number of tiles we have
            for (let t=0; t<this.tileCount; t++) {
                let tileID = t;
                //X and Y position on the spritesheet
                let x = tileID % (this.columns);
                let y = Math.floor(tileID / this.columns);
                //Add in spacing and account for other tiles
                x = x*(this.tileWidth + this.spacing);
                y = y*(this.tileHeight + this.spacing);
                //Store the tile as an object
                this.tiles[tileID] = {
                    x: x,
                    y: y,
                    width: this.tileWidth,
                    height: this.tileHeight
                }
            }
        }

        this.makeSprites = function() {
            if (this.sprites) {
                //Create sprites from the data
                for (const spr in this.sprites) {
                    app.state.image.sprites[spr] = new app.Sprite(spr, this, this.sprites[spr]);
                }
            }
        }

        this.setStart = function(start) {
            this.tileStart = start;
        }

        this.tile = function(id) {
            return this.tiles[id - this.tileStart];
        }
    }

    return Spritesheet;
}());
