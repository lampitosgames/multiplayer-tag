"use strict";

//Audio module
app.audio = (function(){
    let bgAudio = undefined;
    let currentEffect = 0;
    let currentDirection = 1;
    let effectSounds = ["1.mp3", "2.mp3", "3.mp3", "4.mp3", "5.mp3", "6.mp3", "7.mp3", "8.mp3"];

    function init() {
        bgAudio = document.getElementById("bgAudio");
        bgAudio.volume = 0.3;
    }

    function startBGAudio() {
        bgAudio.play();
    }

    function stopBGAudio() {
        bgAudio.pause();
        bgAudio.currentTime = 0;
    }

    function playEffect() {
        let effectSound = document.createElement('audio');
        effectSound.volume = 0.3;
        effectSound.src = "media/" + effectSounds[currentEffect];
        effectSound.play();
        currentEffect += currentDirection;
        if (currentEffect == effectSounds.length || currentEffect == -1) {
            currentDirection *= -1;
            currentEffect += currentDirection;
        }
    }

    return {
        init: init,
        startBGAudio: startBGAudio,
        stopBGAudio: stopBGAudio,
        playEffect: playEffect
    }
}());
