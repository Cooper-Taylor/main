//2d 
//Credit to:
//https://flaviocopes.com/javascript-detect-dark-mode/ for figuring out how to detect dark mode

let gameCanvas = document.getElementById("gameCanvas");
let ctx = gameCanvas.getContext("2d");
let scoreP = document.getElementById("score");
let friction = {x:0.85, y:0.85,};
let gravity = {x:0, y:0.9};
let controller = {
    w:false,
    a:false,
    s:false,
    d:false,
    click:false,
    e:false,
    ArrowUp:false,
    ArrowLeft:false,
    ArrowDown:false,
    ArrowRight:false,
    mousedown:false,
    space:false,
    mouseup:false,
    mousemove:false,
    mouseX:0,
    mouseY:0,
};
let x = 0;
let fireballsColor;
let playerColor;
let backgroundColor;

//Check if the user has dark mode on and adjust if so (From Flavicopes https://flaviocopes.com/javascript-detect-dark-mode/)
if (window.matchMedia && 
    window.matchMedia('(prefers-color-scheme: dark)').matches) {
    //dark mode
    fireballsColor = "#8a8181";
    playerColor = "#8a8181";
    backgroundColor = "#000000";
    scoreP.style.color = "#8a8181";
    console.log("dark mode it is");
} else {
    //light mode
    fireballsColor = "#000000";
    playerColor = "#000000";
    backgroundColor = "#FFFFFF";
    scoreP.style.color = "#000000";
    console.log("light mode it is");
}

//Checks if the user changes color modes and adjusts
window.matchMedia('(prefers-color-scheme: dark)')
.addEventListener('change', (event) => {
if (event.matches) {
    //dark mode
    fireballsColor = "#FFFFFF";
    playerColor = "#FFFFFF";
    backgroundColor = "#000000";
    scoreP.style.color = "#FFFFFF";
    console.log("dark mode it is");
} else {
    //light mode
    fireballsColor = "#000000";
    playerColor = "#000000";
    backgroundColor = "#FFFFFF";
    scoreP.style.color = "#000000";
    console.log("light mode it is");
}
});

function randInt(min, max){
    return Math.floor((Math.random() * ((max + 1) - min)+min));
}

function dist(x1, y1, x2, y2){
    return Math.sqrt( Math.pow((x2 - x1),2) + Math.pow( (y2 - y1), 2));
}

class Player{
    constructor(x, y, w, h, speed){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.velX = 0;
        this.velY = 0;
        this.speed = speed;
        this.jumpSpeed = speed*2;
    }

    update(){
        //this.velX += this.speed;
        //this.velY += this.speed;
        this.velY += gravity.y;
        this.velX += gravity.x;

        this.velX *= friction.x;
        this.velY *= friction.y;

        this.x += this.velX;
        this.y += this.velY;
    }

    interact(){
        if(controller.w){
            this.velY -= this.jumpSpeed;
        }
        if(controller.a){
            this.velX -= this.speed;
        }
        if(controller.s){
            this.velY += this.speed;
        }
        if(controller.d){
            this.velX += this.speed;
        }
    }

    draw(){
        ctx.fillStyle = playerColor;
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    collision(){
        if(this.y + this.h > window.innerHeight){
            this.y = window.innerHeight - this.h;
            this.velY = 0;
        }
        if(this.y < 0){
            this.y = 0;
            this.velY = 0;
        }

        if(this.x + this.w > window.innerWidth){
            this.x = window.innerWidth - this.w;
            this.velX = 0;
        }
        if(this.x < 0){
            this.x = 0;
            this.velY = 0;
        }
    }

}

class Fireball{
    constructor(x, y, r, speed){
        this.x = x;
        this.y = y;
        this.r = r;
        this.speed = {x:speed.x,y:speed.y};
        if(randInt(0,1) === 0){this.speed.x *= -1;} //for some variation in direction
        if(randInt(0,1) === 0){this.speed.y *= -1;}
        this.velX = randInt(-3,3);
        this.velY = randInt(-3,3);

    }

    update(){
        this.velX += this.speed.x;
        this.velY += this.speed.y;

        this.velX *= friction.x;
        this.velY *= friction.y;

        this.x += this.velX;
        this.y += this.velY;
    }

    collision(){
        //check top 
        if(this.y - (this.r/2) < 0 && this.velY < 0){
            this.speed.y *= -1;
            this.velY *= -1;
            this.y = 0 + (this.r/2);
        }

        //left
        if(this.x - (this.r/2) < 0 && this.velX < 0){
            this.speed.x *= -1;
            this.velX *= -1;
            this.x = 0 + (this.r/2);
        }
        //bottom
        if(this.y + (this.r/2) > ctx.canvas.height && this.velY > 0){
            this.speed.y *= -1;
            this.velY *= -1;
            this.y = ctx.canvas.height - (this.r/2);
        }
        //right
        if(this.x + (this.r/2) > ctx.canvas.width && this.velX > 0){
            this.speed.x *= -1;
            this.velX *= -1;
            this.x = ctx.canvas.width - (this.r/2);
        }


    }

    playerCollision(player){
        //top left player box check
        if(dist(this.x, this.y, player.x, player.y) <= this.r){
            return true;
        }
        if(dist(this.x, this.y, player.x + player.w, player.y) <= this.r){
            return true;
        }
        if(dist(this.x, this.y, player.x, player.y+player.h) <= this.r){
            return true;
        }
        if(dist(this.x, this.y, player.x+player.w, player.y+player.h) <= this.r){
            return true;
        }
        
    }

    draw(){
        ctx.fillStyle = fireballsColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * 3.142);
        ctx.fill();

    }


}

class Viewport{
    constructor(x, y, w, h){

    }
}

function Game(){


    let player1 = new Player(0,0,60,60,2);
    let fireballs = [];
    let gameOver = false;
    let score = 0;

    fireballs.push(new Fireball((ctx.canvas.width/2),(ctx.canvas.height/2),40,{x:1.5,y:1.5}));

    let map = [
        [1,0,0,0,0,1],
        [1,0,0,0,0,1],
        [1,0,0,0,0,1],
        [1,0,0,0,0,1],
        [1,0,0,0,0,1],
    ];

  let loop = function Loop(){
        window.requestAnimationFrame(()=>{

            ctx.canvas.height = window.innerHeight;
            ctx.canvas.width = window.innerWidth;
            //ctx.imageSmoothingEnabled = false;

            //background
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
            
            //Player stuff
            player1.interact();
            player1.update();
            player1.collision();
            player1.draw();

            //fireball stuff
            for(x = 0; x < fireballs.length; x++){
                fireballs[x].update();
                fireballs[x].collision();
                fireballs[x].draw();
                if(fireballs[x].playerCollision(player1)){return Game();}; //end game
            }
            
            score++;
            scoreP.innerText = score;

            if(score % 250 === 0 && score <= 2500){
                fireballs.push(new Fireball((ctx.canvas.width/2),(ctx.canvas.height/2), 40,{x:1.5, y:1.5}));
            }
            
            if(gameOver){
                game = new Game();
            }

            window.requestAnimationFrame(loop);
        });
    }

    loop();


}

Game();





//controller input and stuff
function sendUserInput(event){

    controller.click = 0; 
    controller.mousemove = 0; 
    //Makes these values false as click should only fire once and so it should always be set to false to prevent it being true for multiple times
    
    //checks if it a mouse related event or keyboard related event and reacts accordingly
      if(event.type === "mousemove" || event.type === "mousedown" || event.type === "click" || event.type === "mouseup"){

        //To prevent too frequent updates
        if(Math.abs(event.pageX - controller.mouseX) < 1 && Math.abs(event.pageY - controller.mouseY) < 1 && event.type === "mousemove"){                
        }else{

          controller.mouseX = Math.floor(event.pageX); //Account for the canvas scaling
          controller.mouseY = Math.floor(event.pageY);
      
          switch(event.type){
                  case "mousemove":
                    controller.mousemove = 1;
                  break;
                  case "click":
                    controller.click = 1;
                  break;  
                  case "mouseup":
                    controller.mousedown = 0; controller.mouseup = 1; 
                    controller.e = 0;
                  break;
                  case "mousedown":
                    controller.mouseup = 0; controller.mousedown = 1;
                    controller.e = 1;
                  break;
                }
                
        }

      }else{

        let key_state = (event.type == "keydown")?1:0;
        switch(event.key) {
              case 'w'://w key
                controller.w = key_state;
              break;
              case 'a'://a key
                controller.a = key_state;
              break;
              case 's'://s key
                controller.s = key_state;
              break;
              case 'd'://d key
                controller.d = key_state;
              break;
              case 'e':
                controller.e = key_state;
              
              break;
              case 'ArrowUp'://up key
                controller.w = key_state;
              break;
              case 'ArrowLeft'://left key
                controller.a = key_state;
              break;
              case 'ArrowDown'://down key
                controller.s = key_state;
              break;
              case 'ArrowRight'://right key
                controller.d = key_state;
              break;
              case ' ':
                controller.e = key_state;
              break;
          }
      }
    
}

  window.addEventListener("keydown", sendUserInput );
  window.addEventListener("keyup", sendUserInput );
  window.addEventListener("click", sendUserInput);
  window.addEventListener("mousedown", sendUserInput);
  window.addEventListener("mouseup", sendUserInput);
  window.addEventListener("mousemove", sendUserInput);