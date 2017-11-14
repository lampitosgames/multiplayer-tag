"use strict";

/**
 * Incredibly basic particle system to meet the minimum requirements
 */
app.particle = (function() {
    let a = app;

    let s, sg, sv;

    function init() {
        s = a.state;
        sg = s.game;
        sv = s.view;
    }

    function Emitter(_pos, _grav) {
        this.pos = _pos;
        this.grav = _grav;

        this.particles = [];

        this.update = function() {
            for (let i=0; i<this.particles.length; i++) {
                if (this.particles[i].lifespan < 0) {
                    this.particles.splice(i, 1);
                    i -= 1;
                    continue;
                }
                this.particles[i].vel.add(this.grav);
                this.particles[i].update();
                this.particles[i].draw();
            }
            let randPos = this.pos.clone();
            let randVel = new Victor(a.utils.randomRange(-1, 1), a.utils.randomRange(-4, 0));
            this.particles.push(new Particle(randPos, randVel, 1));
        }

    }

    function Particle(_pos, _vel, _lifespan, _color = "rgba(241, 156, 183, 0.6)", _radius = 0.15) {
        this.pos = _pos;
        this.vel = _vel;
        this.lifespan = _lifespan;
        this.color = _color;
        this.radius = _radius;

        this.update = function() {
            this.pos.add(this.vel.clone().divideScalar(sg.gu));
            this.lifespan -= a.time.dt();
        }
        this.draw = function() {
            let c = a.ctx;
            let drawPos = sv.active.getObjectRelativePosition(this, true);
            c.fillStyle = this.color;
            c.beginPath();
            c.arc(drawPos.x, drawPos.y, this.radius * sg.gu, 0, Math.PI * 2);
            c.closePath();
            c.fill();
        }
    }
    return {
        init: init,
        Emitter: Emitter,
        Particle: Particle
    }
}());
