//TitleScreen Code

function changeScreen(screen){
    if(screen == "myCanvas"){
        document.getElementById("titleScreen").style.visibility = "hidden";
        document.getElementById("myCanvas").style.visibility = "visible";
    }
    else{
        document.getElementById("titleScreen").style.visibility = "visible";
        document.getElementById("myCanvas").style.visibility = "hidden";
    }
}

//GameCode
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;

//Temp draw bird
ctx.fillRect(Math.floor(window.innerWidth/3),200,45,45);

//creating new main game
var main = new Main;
var player = main.player;

//Thanks Adam :)
function checkInput(event){
    if (main.bird.dy > -2){
        switch(event.key){
            case 'w':
            player.jump();
            break;

            case 'Spacebar':
            player.jump();
            break;

            case ' ':
                player.jump();
            break;

            case 'Enter':
                player.jump();
            break;

            case 'ArrowUp':
                player.jump();
            break;
        }
    }

    let key_state = (event.type == "keydown") ? 1 : 0;
    switch(event.key){
        case 'a':
            player.left = key_state;
        break;

        case 'd':
            player.right = key_state;
        break;

        case 'ArrowLeft':
            player.left = key_state;
        break;

        case 'ArrowRight':
            player.right = key_state;
        break;
    }
}



//Differentiate between first and next clicks
document.getElementById("myCanvas").addEventListener("click", () =>{
    ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
    Update();
},{once : true});

window.addEventListener("keydown", checkInput);
window.addEventListener("keyup", checkInput);

//Used html document onclick to allow for both touchscreen and mouse interactions.
/*
var isTouch = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0));
if(isTouch){
    window.addEventListener("touchstart",player.jump());
} else{
    window.addEventListener("click",player.jump());
}
*/


function Update(){
    if(main.gameRunning){
        requestAnimationFrame(Update);
        main.updateGame();
    }
    else{
        main = new Main;
        player = main.player;
        ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
        document.getElementById("myCanvas").addEventListener("click", () =>{
            ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
            Update();
        },{once : true});
        console.log('dead');
        ctx.fillStyle = "black";
        ctx.fillRect(Math.floor(window.innerWidth/3),200,45,45);
        changeScreen("titleScreen");
    }
}



function Main(){
    //Initializing some variables
    this.score = 0;
    this.bird = {x:(Math.floor(window.innerWidth/3)),y:200,dx:0,dy:0,size:45};
    this.gameRunning = true;
    this.pipeArray = [];

    var gameClass = this;
    this.player = new Player();

    this.pipeArray.push(new Pipe(window.innerWidth,0,200,'top',-3), new Pipe(window.innerWidth,window.innerHeight - 300,300,'bottom',-3));

    //Generates pipes
    this.generatePipe = function(){
        //two parts top:
        var x = window.innerWidth;
        var y = 0;
        //Pipe can go down max, 3/5ths of the way down the screen
        var height = Math.floor(Math.random() * window.innerHeight * (3/5));
        var rel = 'top';
        var dx = 0;
        this.pipeArray.push(new Pipe(x,y,height,rel,dx));
 
        //bottom;
        x = window.innerWidth;
        y = height + 220; //220 is the space between the top and bottom pipe
        height = window.innerHeight - y;
        rel = 'bottom';
        dx = 0;
        this.pipeArray.push(new Pipe(x,y,height,rel,dx));
    }



    this.updateGame = function(){
        ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
        
        //Drawing bird
        ctx.fillStyle = "black";
        ctx.fillRect(this.bird.x,this.bird.y,this.bird.size,this.bird.size);

        //Player Things:
        this.player.applyGravity();
        this.player.update();

        //looping through present pipes
        for(let i = 0; i < this.pipeArray.length; i++){
            //console.log(this.pipeArray)
            this.pipeArray[i].updatePipe();
        }

        //Adding to score
        this.score += 1/4;

        //displaying score
        var scoreText = {x: ctx.canvas.width/2, y: 150, text: `${Math.floor(this.score)}`};
        ctx.fillStyle = "#F5F5F5";
        ctx.font = "10vh serif";
        ctx.textAlign = "center";
        ctx.fillText(scoreText.text, scoreText.x, scoreText.y);

        if (this.calcPipe()){
            this.generatePipe();
        } 
    }



    //Timing pipe generation
    var rate = 40;
    this.calcPipe = function(){
        rate = (this.score < 500) ? 40 : 25;
        if (rate == 26 && this.score > 1000){
            rate = 15;
        }
        if(this.score % rate === 0){
            return true;
        }
    }



    function Player(){
        this.left = 0;
        this.right = 0;
        this.speed = 8;

        this.jump = function(){
            gameClass.bird.dy = -10;
        }
        this.applyGravity = function(){
            gameClass.bird.dy += 0.4;
        }

        this.update = function(){
            gameClass.bird.dx = 0;
            if (this.left){
                gameClass.bird.dx = (gameClass.bird.x <= 0)? 0:-this.speed;
            }
            if (this.right){
                gameClass.bird.dx = (gameClass.bird.x + gameClass.bird.size>= window.innerWidth)? 0:this.speed;
            }

            gameClass.bird.y += gameClass.bird.dy;
            gameClass.bird.x += gameClass.bird.dx;
        }
    }



    //even intervals on pipes, constant width
    function Pipe(x,y,height,rel,dx){
        this.WIDTH = 125;
        //This variable describes the relative position (top or bottom) of the pipe
        this.rel = rel
        this.y = y;
        this.x = x;
        this.height = height;
        this.dx = dx;

        this.draw = function(){
            ctx.fillStyle = "black";
            ctx.fillRect(this.x,this.y,this.WIDTH,this.height);
        }

        this.updatePipe = function(){
            //Calculating and Moving
            this.calcSpeed()
            this.x += this.dx;

            //collision detection - sets gameRunning to false
            if(((gameClass.bird.x + gameClass.bird.size >= this.x && gameClass.bird.x + gameClass.bird.size <= this.x + this.WIDTH) || 
            (gameClass.bird.x >= this.x && gameClass.bird.x <= this.x + this.WIDTH)) && 
            ((gameClass.bird.y <= this.y + this.height && this.rel === 'top') || 
            (gameClass.bird.y + gameClass.bird.size >= this.y && this.rel === 'bottom'))){
                gameClass.gameRunning = false;
            }

            //Checking if the play is above or below the playing area;
            if((gameClass.bird.y <= 0 || gameClass.bird.y + gameClass.bird.size>= window.innerHeight)){
                gameClass.gameRunning = false;
            }
            this.draw()

            //If the array is off screen, remove it from array; doesn't matter the order since they are added in a linear fashion
            //Try to ensure that the next pipe is off the screen to negate flashes
            if(gameClass.pipeArray[0].x + this.WIDTH < -window.innerWidth/2){
                gameClass.pipeArray.shift();
                gameClass.pipeArray.shift();
            }
        }


        this.MAX = -20;
        this.MIN = -3;
        //Calculating how fast the pipes should be moving
        this.calcSpeed = function(){
            this.calc = (gameClass.score/375) * -4;

            if(this.calc > this.MAX && this.calc < this.MIN){
                this.dx = this.calc;
            }else if(this.calc < this.MAX){
                this.dx = this.MAX;
            }else{
                this.dx = this.MIN;
            }
        }
    }
}


//Plan is to keep the player in place on the x-axis, and move the pipes from right to left across the screen
/*Once they are off the screen, since they are going always going to be linear, 
we can simply just do a shift method onto an array that contain active pipes */
