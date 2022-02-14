
//min and max are both inclusive
function randInt(min, max){
    return Math.floor((Math.random() * ((max+1) - min)+min));
}
//min inclusive and max exclusive
function randFloat(min, max){
    return (Math.random() * ((max+1) - min)+min);
}

class Particle {
    constructor(x, y, life, velX = randFloat(-20,20), velY = randFloat(-50,-35)){
        this.x = x;
        this.y = y;
        this.velX = velX;
        this.velY = velY;
        this.life = life;

    }
    update(i, list){
        this.velX *= friction.x;
        this.velY *= friction.y;

        this.velY += gravity.y;
        this.velX += gravity.x;

        this.velX += 0;
        //this.velY += -0.3;

        this.x += this.velX;
        this.y += this.velY;

        this.life--;

        if(this.life <= 0){
            list.splice(i, 1);
        }
    }
    draw(){
        ctx.fillStyle = "rgba(255,0,0," + (this.life/100) + ")";
        ctx.fillRect(this.x, this.y, 10, 10);
    }
}

class ParticleEngine {
    constructor(){
        this.particles = [];
        this.pLife = 100; //50 game ticks
        this.pSize = 10; //pixels
        this.pSpeed = 5; //Added to velocity
        this.p; //for iterating as the reference for the current obj
    }

    createParticleSplash(x, y, numP, pVelX = {min:-10, max:10}, pVelY = {min:-10, max: 10}, pLife = 100, pSize = 10){
        let z;
        for(z = 0; z < numP; z++){
            this.particles.push(new Particle(
                x + randInt(-30,30), 
                y + randInt(-30,30), 
                pLife, 
                randFloat(pVelX.min, pVelX.max), 
                randFloat(pVelY.min, pVelY.min)
            ));
        }
    }

    updateAndDraw(){
        let x;
        for(x = 0; x < this.particles.length; x++){
            this.p = this.particles[x];
            this.p.update(x, this.particles);
            this.p.draw();
        }       
    }

}

