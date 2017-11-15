"use strict";

/**
 * Module that loads level data from a file using the Tiled Editor format
 * This lets me use an external tool to build levels with multiple tilesets
 * Works in tandem with the physics system and the client-side image system
 * Server/client agnostic with some specific code for each
 */
(function() {
    //Server Only module
    let jsonFile;

    //Modules
    let utils;
    let state;
    let physics;

    //Server or client
    let useNodeJS = false;

    /**
     * Init the loader module
     */
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

    /**
     * Start the loader module.  Called after all modules have been loaded
     */
    function start() {
        //JSON loading promise
        let JSONLoaded;
        //If server side
        if (useNodeJS) {
            //Load json via the server
            JSONLoaded = getJSONServer('app/assets/mapData/mainLevel.json');
            //Else, loading on the client
        } else {
            //Load via the client
            JSONLoaded = getJSONClient('./assets/mapData/mainLevel.json');
            //Push the promise onto the list of pre-loading promises (client side loading state)
            state.game.loading.push(JSONLoaded);
        }

        //Once the promise has loaded, load the level
        JSONLoaded.then(loadLevel);
    }

    /**
     * Load level JSON on the server
     */
    function getJSONServer(filepath) {
        //Return a promise
        return new Promise(function(resolve, reject) {
            //Use jsonFile npm package to load the level
            jsonFile.readFile(filepath, function(err, obj) {
                if (err) {
                    reject(err);
                }
                resolve(obj);
            });
        });
    }

    /**
     * Load level JSON on the client
     */
    function getJSONClient(filepath) {
        //Return a promise
        return new Promise(function(resolve, reject) {
            //Load a new level using xml request
            let request = new XMLHttpRequest();
            request.open('GET', filepath);
            request.responseType = 'json';
            request.onload = function() {
                //Once loaded, return the data
                let levelData = request.response;
                resolve(request.response);
            }
            request.send();
        });
    }

    /**
     * After the json data is loaded into javascript, call this to create the level state
     */
    function loadLevel(data) {
        //Grab all layers in the data
        let layers = data.layers;
        //The tile width and height for this level
        let th = data.tileheight;
        let tw = data.tilewidth;
        //Loop through every layer
        for (let i = 0; i < layers.length; i++) {
            //If this is a tile layer and code is running on the client
            if (layers[i].name === "tiles" && !useNodeJS) {
                //Create a new tile layer in the image module
                app.image.createTileLayer(layers[i]);

                //Else, if this is a solid platform object layer
            } else if (layers[i].name === "solidPlatforms") {
                //Loop through all objects
                for (let o = 0; o < layers[i].objects.length; o++) {
                    let obj = layers[i].objects[o];
                    //Create a platform for this object with the json-provided dimensions
                    physics.getPlatform(obj.x / tw, obj.y / th, obj.width / tw, obj.height / th);
                }

                //Else, if this is a non-solid platform layer
            } else if (layers[i].name === "nonSolidPlatforms") {
                //Loop through all objects
                for (let o = 0; o < layers[i].objects.length; o++) {
                    let obj = layers[i].objects[o];
                    //create a non-solid platform for this object with the json-provided dimensions
                    let plat = physics.getPlatform(obj.x / tw, obj.y / th, obj.width / tw, obj.height / th);
                    plat.solid = false;
                }
            }
        }
        //Set up the spritesheets the level uses if on the client
        if (!useNodeJS) {
            //Get tileset information
            let tilesets = data.tilesets;
            //Loop through all tilesets used
            for (let i = 0; i < tilesets.length; i++) {
                //Set the starting id for each sheet (sheets load seperately)
                state.image.tilesheets[tilesets[i].source].setStart(tilesets[i].firstgid);
            }
        }
    }

    //Export everything
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
