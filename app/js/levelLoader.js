"use strict";

(function() {
    //Server Only
    let jsonFile;

    //Modules
    let utils;
    let state;
    let physics;

    //Server or client
    let useNodeJS = false;

    function init() {
        //Detect server/client and import other modules
        if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
            jsonFile = require('jsonfile');
            utils = require('./utils.js');
            state = require('../server/js/serverState');
            physics = require('./physics/physics');
            //Running on the server
            useNodeJS = true;
        } else {
            utils = app.utils;
            state = app.state;
            physics = app.physics;
        }
    }

    function start() {
        let JSONLoaded;
        if (useNodeJS) {
            JSONLoaded = getJSONServer('app/assets/mapData/testMap.json');
        } else {
            JSONLoaded = getJSONClient('./assets/mapData/testMap.json');
        }

        JSONLoaded.then(loadLevel);
    }

    function getJSONServer(filepath) {
        return new Promise(function(resolve, reject) {
            jsonFile.readFile(filepath, function(err, obj) {
                if (err) {
                    reject(err);
                }
                resolve(obj);
            });
        });
    }

    function getJSONClient(filepath) {
        return new Promise(function(resolve, reject) {
            //Load a new level.  For now, just create platforms
            let request = new XMLHttpRequest();
            request.open('GET', filepath);
            request.responseType = 'json';
            request.onload = function () {
                let levelData = request.response;
                resolve(request.response);
            }
            request.send();
        });
    }

    function loadLevel(data) {
        let layers = data.layers;
        let th = data.tileheight;
        let tw = data.tilewidth;
        for (let i=0; i<layers.length; i++) {
            //If this is a tile layer and code is running on the client
            if (layers[i].name === "tiles" && !useNodeJS) {
                app.image.createTileLayer(layers[i]);

            //Else, if this is a solid platform object layer
            } else if (layers[i].name === "solidPlatforms") {
                //Loop through all objects
                for (let o=0; o<layers[i].objects.length; o++) {
                    let obj = layers[i].objects[o];
                    //Create a platform for this object
                    physics.getPlatform(obj.x / tw, obj.y / th, obj.width / tw, obj.height / th);
                }

            //Else, if this is a non-solid platform layer
            } else if (layers[i].name === "nonSolidPlatforms") {
                //Loop through all objects
                for (let o=0; o<layers[i].objects.length; o++) {
                    let obj = layers[i].objects[o];
                    //create a non-solid platform for this object
                    let plat = physics.getPlatform(obj.x / tw, obj.y / th, obj.width / tw, obj.height / th);
                    plat.solid = false;
                }
            }
        }
    }

    let _loader = {
        init: init,
        start: start
    };

    //Export or store it on the app object
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = _loader;
    } else {
        app.levelLoader = _loader;
    }
}());
