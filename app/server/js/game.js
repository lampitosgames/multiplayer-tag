import time from '../../js/time';
import Victor from 'victor';
import utils from '../../js/utils';

let init = () => {
    utils.init();
    time.init();

    var vec1 = new Victor(300, 200);
    var vec2 = new Victor(100, 200);
    utils.lerpVec(0.5, vec1, vec2);
}

let update = () => {
    setTimeout(update, (1000/60));
    time.update();
}

let _game = {
    init, update
}

export default _game;
