"use strict";

//Audio module used for loading and manipulating audio files/buffers/data
app.audio = (function() {
    let a = app;
    let s, sa, sg;

    /**
     * Initialize the audio module
     */
    function init() {
        //Shorthand state
        s = a.state;
        sa = s.audio;
        sg = s.game;

        //Initialize audio context
        createAudioContext();

        //Loop through and load all sounds
        for (let i=0; i<sa.soundNames.length; i++) {
            let sid = sa.soundNames[i];
            //Create a new sound object
            sa.sounds[sid] = new Sound(sid);
            //Load the sound
            sg.loading.push(sa.sounds[sid].load());
        }
    }

    /**
     * Update the audio module
     */
    function update() {
        //Check if the song has ended and if the game state is playing/paused
        if (sa.sounds["backgroundMusic.mp3"].getAudioLength() != -1 && s.time.timers["backgroundMusic.mp3"] > sa.sounds["backgroundMusic.mp3"].getAudioLength() - 30.0) {
            sa.sounds["backgroundMusic.mp3"].start();
            sa.sounds["backgroundMusic.mp3"].gain.gain.value = s.e.MUSIC_VOLUME;
            return;
        }
    }

    function createAudioContext() {
        //Create our audio context
        sa.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    }

    /**
     * Sound Object
     */
    function Sound(_id) {
        this.id = _id;
        this.ready = false;
        this.playing = false;
        this.audioBuffer = undefined;
        this.source = undefined;
        this.gain = undefined;

        /**
         * Returns a promise that resolves once the audio has loaded
         * It also runs setup for the sound object
         */
        this.load = function() {
            let sound = this;
            return new Promise(function(resolve, reject) {
                //Create a GET request for the audio buffer
                var request = new XMLHttpRequest();
                request.open('GET', "./assets/audio/" + sound.id, true);
                request.responseType = 'arraybuffer';
                request.onload = function() {
                    //Create a gain node
                    sound.gain = sa.audioCtx.createGain();
                    //Connect nodes
                    sound.gain.connect(sa.audioCtx.destination);

                    //Decode the data with the pre-existing audio context
                    sa.audioCtx.decodeAudioData(request.response, function(_buffer) {
                        //Pass this buffer data into the audio source node
                        sound.audioBuffer = _buffer;
                        //Create a source node
                        sound.source = sa.audioCtx.createBufferSource();
                        sound.source.connect(sound.gain);
                        sound.source.buffer = sound.audioBuffer;
                        //This sound is ready to play
                        sound.ready = true;
                        //Set the gain sound
                        sound.gain.gain.value = s.e.DEFAULT_VOLUME;
                        //Resolve the promise
                        resolve();
                    //Call the failure callback
                    }, reject);
                }
                //After creating the request, send it
                request.send();
            });
        }

        /**
         * Start the sound
         */
        this.start = function() {
            if (this.playing) {
                this.stop();
            }
            this.source.start();
            this.playing = true;
            a.time.startNewTimer(this.id);
        }

        /**
         * Stop the sound
         */
        this.stop = function() {
            this.playing = false;
            this.source.stop();
            //Create another source node
            this.source = sa.audioCtx.createBufferSource();
            this.source.connect(this.gain);
            this.source.buffer = this.audioBuffer;
        }

        /**
         * Get the length (in seconds) of the sound
         */
        this.getAudioLength = function() {
            return this.source.buffer.duration;
        }
    }

    return {
        init: init,
        update: update,
        Sound: Sound
    };
}());
