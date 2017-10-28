"use strict";

class Particle {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.velx = 0;
        this.vely = 0;
        this.radius = radius;
    }
    setVel(x, y) {
        this.velx = x;
        this.vely = y;
    }
    update(dt) {
        this.x += this.velx * dt;
        this.y += this.vely * dt;
    }
}

class Circle extends Particle {
    constructor(x, y, radius, color) {
        super(x, y, radius);
        this.color = color;
    }
    update(dt) {
        this.x += this.velx * dt;
        this.y += this.vely * dt;
        app.utils.checkBoundingCollision(this);
    }
    draw() {
        app.ctx.save();
        if (app.state.main.gameState == app.state.e.BEGIN || app.state.main.gameState == app.state.e.ROUND_OVER || app.state.main.gameState == app.state.e.REPEAT_LEVEL || app.state.main.gameState == app.state.e.END) {
            app.ctx.globalAlpha = 0.3;
        } else {
            app.ctx.globalAlpha = 0.75;
        }
        app.utils.fillCircle(this.x, this.y, this.radius, this.color);
        app.ctx.restore();
    }
    explode() {
        //remove this particle from the array
        let index = app.state.main.particles.indexOf(this);
        if (index > -1) { app.state.main.particles.splice(index, 1); }
        //Create a new exploding particle in its place
        app.state.main.explosions.push(new Explosion(this.x, this.y, this.radius, this.color));
    }
}

class Explosion extends Circle {
    constructor(x, y, radius, color) {
        super(x, y, radius, color);
        //How long after the explosion hits maximum radius should it stay active
        this.countdown = app.state.e.MAX_LIFETIME;
        //Increase the round Score
        app.state.main.roundScore += 1;
        app.audio.playEffect();
    }
    update(dt) {
        //Collide with all active circles
        let pList = app.state.main.particles;
        for (var i=0; i<pList.length; i++) {
            let p = pList[i];
            if (app.utils.circleCollision(this, p)) {
                p.explode();
            }
        }

        //UPDATE RADIUS
        //If the countdown has expired, implode
        if (this.countdown <= 0) {
            //Subtract delta-multiplied implosion speed
            this.radius -= app.state.e.IMPLOSION_SPEED * dt;
            //If the explosion has hit minimum radius, delete it
            if (this.radius <= app.state.e.MIN_RADIUS) {
                let index = app.state.main.explosions.indexOf(this);
                if (index > -1) { app.state.main.explosions.splice(index, 1); }
            }
            //Return so other code doesn't run
            return;
        }

        //If the explosion has not reached maximum radius
        if (this.radius < app.state.e.MAX_RADIUS ) {
            //Increase the radius
            this.radius += app.state.e.EXPLOSION_SPEED * dt;
        //Else, increment the timer
        } else { this.countdown -= dt; }
    }
    draw() {
        app.ctx.save();
        if (app.state.main.gameState == app.state.e.BEGIN || app.state.main.gameState == app.state.e.ROUND_OVER || app.state.main.gameState == app.state.e.REPEAT_LEVEL || app.state.main.gameState == app.state.e.END) {
            app.ctx.globalAlpha = 0.3;
        } else {
            app.ctx.globalAlpha = 0.75;
        }
        app.utils.fillCircle(this.x, this.y, this.radius, this.color);
        app.ctx.restore();
    }
}

class Cursor extends Particle {
    constructor(radius, color, lineWidth) {
        super(app.mouse[0], app.mouse[1], radius);
        this.color = color;
        this.lineWidth = lineWidth;
        this.velx = 0;
        this.vely = 0;
    }
    update(dt) {
        this.x = app.mouse[0];
        this.y = app.mouse[1];
    }
    draw() {
        app.utils.strokeCircle(this.x, this.y, this.radius, this.color, this.lineWidth)
    }
    click() {
        if (app.state.main.gameState != app.state.e.DEFAULT) {
            app.state.main.gameState = app.state.e.DEFAULT;
        }
        let pList = app.state.main.particles;
        for (var i=0; i<pList.length; i++) {
            let p = pList[i];
            if (app.utils.circleCollision(app.state.main.cursor, p)) {
                p.explode();
                app.state.main.gameState = app.state.e.EXPLODING;
            }
        }
    }
}
