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
ctx.fillRect(200,200,30,30);

var arbCount = 0;

document.getElementById("myCanvas").addEventListener("click", ()=>{
    if (arbCount === 0){
        ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
        Update();
    }
    arbCount++;
})

function Main(){
    //Initializing some variables
    this.score = 0;
    this.bird = {x:200,y:200,dy:0,size:30};
    this.gameRunning = true;
    this.pipeArray = [];

    var mainClass = this;

    this.pipeArray.push(new Pipe(window.innerWidth,0,200,'top',-3), new Pipe(window.innerWidth,window.innerHeight - 300,300,'bottom',-3));

    this.reset = function(){
        this.score = 0;
        this.bird = {x:200,y:200,dy:0,size:30};
        this.gameRunning = true;
        this.pipeArray = [];
        this.pipeArray.push(new Pipe(window.innerWidth,0,200,'top',-3), new Pipe(window.innerWidth,window.innerHeight - 300,300,'bottom',-3));
    }

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
        y = height + 300; //300 is the space between the top and bottom pipe
        height = window.innerHeight - y;
        rel = 'bottom';
        dx = 0;
        this.pipeArray.push(new Pipe(x,y,height,rel,dx));
    }

    this.updateGame = function(){
        ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
        
        //Drawing bird
        ctx.fillRect(this.bird.x,this.bird.y,this.bird.size,this.bird.size);

        //looping through present pipes
        for(let i = 0; i < this.pipeArray.length; i++){
            //console.log(this.pipeArray)
            this.pipeArray[i].updatePipe();
        }

        //Adding to score
        this.score += 1/4;

        //displaying score
        var scoreText = {x: ctx.canvas.width/2, y: 150, text: `${Math.floor(this.score)}`};
        ctx.font = "10vh serif";
        ctx.textAlign = "center";
        ctx.fillText(scoreText.text, scoreText.x, scoreText.y);

        if (this.calcPipe()){
            this.generatePipe();
        } 
    }

    //Timing pipe generation
    var rate = 80;
    this.calcPipe = function(){
        console.log(Math.floor(this.score) % rate);
        if(this.score % rate === 0){
            return true;
        }
        else{
            return false;
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
            ctx.fillRect(this.x,this.y,this.WIDTH,this.height);
        }

        this.updatePipe = function(){
            //Calculating and Moving
            this.calcSpeed()
            this.x += this.dx;

            //collision detection - sets gameRunning to false
            if((mainClass.bird.x + mainClass.bird.size >= this.x && mainClass.bird.x + mainClass.bird.size <= this.x + this.WIDTH) && 
            ((mainClass.bird.y <= this.y + this.height && this.rel === 'top') || 
            (mainClass.bird.y + mainClass.bird.size >= this.y && this.rel === 'bottom'))){
                mainClass.gameRunning = false;
            }

            //Checking if the play is above or below the playing area;
            if((mainClass.bird.y <= 0 || mainClass.bird.y + mainClass.bird.size>= window.innerHeight)){
                mainClass.gameRunning = false;
            }
            this.draw()


            //If the array is off screen, remove it from array; doesn't matter the order since they are added in a linear fashion
            //Means the first two items on the array will always have the closest x value to 0 (since the top and bottom are separate pipes)

            if(this.x + this.WIDTH < 0){
                mainClass.pipeArray.shift();
                mainClass.pipeArray.shift();
            }
        }

        this.MAX = -15;
        this.MIN = -3;
        //Calculating how fast the pipes should be moving
        this.calcSpeed = function(){

            this.calc = (mainClass.score/375) * -4;

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

var main = new Main;

function Update(){
    if(main.gameRunning){
        requestAnimationFrame(Update);
        main.updateGame();
    }
    else{
        main = new Main;
        ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
        arbCount = 0;
        console.log('dead');
        ctx.fillRect(200,200,30,30);
        changeScreen("titleScreen");
    }
}

//Plan is to keep the player in place on the x-axis, and move the pipes from right to left across the screen
/*Once they are off the screen, since they are going always going to be linear, 
we can simply just do a shift method onto an array that contain active pipes */
