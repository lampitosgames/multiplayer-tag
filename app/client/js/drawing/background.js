"use strict";

app.Background = (function() {
    function Background(_name) {
        //Is the background ready?
        this.ready = false;
        this.img = undefined;
        this.name = _name;
        //Width and height of the source image
        this.width = 0;
        this.height = 0;
        this.whRatio = undefined;
        this.hwRatio = undefined;

        //Parallax speed relative to the view
        this.parallaxSpeed = [-0.5, -0.4];

        //Load the background.  Returns a promise
        this.load = function() {
            let back = this;
            //Return a promise that resolves once the background has been loaded
            return new Promise(function(resolve, reject) {
                try {
                    //Load the Image
                    back.img = new Image();
                    back.img.onload = function() {
                        //Set the sheet to ready
                        back.ready = true;
                        //Get the height/width of the source image
                        back.width = back.img.width;
                        back.height = back.img.height;
                        //Get ratios so we can keep them constant
                        back.whRatio = back.width / back.height;
                        back.hwRatio = back.height / back.width;
                        //Resolve the promise once loaded
                        resolve(back);
                    }
                    back.img.src = "./assets/backgrounds/" + back.name;
                } catch (error) {
                    reject(error);
                }
            });
        }
    }

    return Background;
}());
