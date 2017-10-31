"use strict";

app.keys = (function() {
    let a = app;

    //Object containing key states
    let keys = {};

    //Mouse state variables
    let mouse;
    let mouseDown;

    function init() {
        //Add an event listener for keydown
        window.addEventListener("keydown", function(e) {
            //If this key isn't in the object, create data for it
            if (typeof(keys[e.keyCode]) === "undefined") {
                keys[e.keyCode] = {
                    pressed: true,
                    keyDown: [],
                    keyUp: []
                };
            } else {
                //Set the key to pressed
                keys[e.keyCode].pressed = true;
                //Loop and call all bound functions
                for (let i = 0; i < keys[e.keyCode].keyDown.length; i++) {
                    keys[e.keyCode].keyDown[i]();
                }
            }
        });

        //Add an event listener for keyup
        window.addEventListener("keyup", function(e) {
            //If this key isn't in the object, create data for it
            if (typeof(keys[e.keyCode]) === "undefined") {
                keys[e.keyCode] = {
                    pressed: false,
                    keyDown: [],
                    keyUp: []
                };
            } else {
                //Set the key to not pressed
                keys[e.keyCode].pressed = false;
                //Loop and call all bound functions
                for (let i = 0; i < keys[e.keyCode].keyUp.length; i++) {
                    keys[e.keyCode].keyUp[i]();
                }
            }
        });

        //Add an event listener for mouse movement
        window.addEventListener("mousemove", function(e) {
            //Get the mouse position
            mouse = [e.clientX, e.clientY];
        });
    }

    function start() {
        app.canvas.addEventListener('mousedown', function() {
            mouseDown = true;
        });
        app.canvas.addEventListener('mouseup', function() {
            mouseDown = false;
        });
    }

    /**
     * Bind a function to a key to be called when that key is pressed.
     * Accepts the char code or a string
     */
    function keyDown(key, callback) {
        //Get the key code
        let keyCode = getKeyCode(key);
        //If data does not exist for this key, create it
        if (typeof(keys[keyCode]) === "undefined") {
            keys[keyCode] = {
                pressed: false,
                keyDown: [],
                keyUp: []
            };
        }
        //Push the callback function to the array
        keys[keyCode].keyDown.push(callback);
    }

    /**
     * Bind a function to a key to be called when that key is released.
     * Accepts the char code or a string
     */
    function keyUp(key, callback) {
        //Get the key code
        let keyCode = getKeyCode(key);
        //If data does not exist for this key, create it
        if (typeof(keys[keyCode]) === "undefined") {
            keys[keyCode] = {
                pressed: false,
                keyDown: [],
                keyUp: []
            };
        }
        //Push the callback function to the array
        keys[keyCode].keyUp.push(callback);
    }

    /**
     * Return whether a key is pressed
     * Accepts the char code or a string
     */
    function pressed(key) {
        //Get the key code
        let keyCode = getKeyCode(key);
        //If data does not exist for this key, create it
        if (typeof(keys[keyCode]) === "undefined") {
            keys[keyCode] = {
                pressed: false,
                keyDown: [],
                keyUp: []
            };
        }
        //Return whether or not the key is pressed
        return keys[keyCode].pressed;
    }

    /**
     * Returns the numerical keycode given a string
     * Does nothing if an integer is passed
     * This only covers the most common keys
     */
    function getKeyCode(key) {
        let keyCode = key;
        if (typeof key === 'string') {
            //This is probably inefficient
            switch (key) {
                case "up":
                    keyCode = 38;
                    break;
                case "down":
                    keyCode = 40;
                    break;
                case "left":
                    keyCode = 37;
                    break;
                case "right":
                    keyCode = 39;
                    break;
                case "space":
                    keyCode = 32;
                    break;
                case "shift":
                    keyCode = 16;
                    break;
                case "ctrl":
                    keyCode = 17;
                    break;
                case "alt":
                    keyCode = 18;
                    break;
                case "tab":
                    keyCode = 9;
                    break;
                case "enter":
                    keyCode = 13;
                    break;
                case "backspace":
                    keyCode = 8;
                    break;
                case "esc":
                    keyCode = 27;
                    break;
                case "del":
                    keyCode = 46;
                    break;
                case "ins":
                    keyCode = 45;
                    break;
                case "windows":
                    keyCode = 91;
                    break;
                default:
                    keyCode = key.toUpperCase().charCodeAt(0);
                    break;
            }
        }
        return keyCode;
    }

    return {
        init: init,
        start: start,
        keyUp: keyUp,
        keyDown: keyDown,
        pressed: pressed,
        mouse: function() {
            return mouse;
        },
        mouseDown: function() {
            return mouseDown;
        }
    }
}());
