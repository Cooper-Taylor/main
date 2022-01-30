            
        //Useful Site https://codepen.io/andyranged/pen/aPojMW
        //Also thanks to Poth on Programming 
        /*  List of all the resources I needed 
            
            http://proclive.io/shooting-tutorial/
        
            https://www.codepen.io/andyranged/pen/aPojMW
            
            https://www.youtube.com/channel/UCdS3ojA8RL8t1r18Gj1cl6w/videos
            
            Sounds from Youtube Audio Library:
                Made by an listed author:
                Monumental Journey - By Jesse Gallagher
                Cloud Wheels, Castle Builder - By Puddle of Infinity
                
                Other:
                ButtonPush
                LogScrapeBoulder
                Wooden Sticks
                WalkingOnStoneFloor
                
            Sounds from  https://www.zapsplat.com:
            
            
        
        */
        
        /*
                PLANNED CONTENT:
            +Make the slimes do damage to player //done
            +Add knockback when using sword //done
            +Add a improved mob function system //done
            
            +Clean up poor coding 
            +Possibly add a new mob  //done
            +Add interactive tiles //done
            +Polish Inventory System //done
                POSSIBILITES:
            +Remake the player collision and such //done
            
        */
        
            var player, world, collision, context, controller,bullets, mobs, vmax, x_min, x_max, y_min, y_max;
    
        
            var context = document.querySelector("canvas").getContext("2d");
            
            var height = document.documentElement.clientHeight;
            var width = document.documentElement.clientWidth;
            var backgroundColor = "#202020";
            vmax = Math.max(height, width);
            
            var masterVolume = 1;
            var loadedState = false;
            var bullets = [];
            var mobBullets = [];
            var items = [];
            var crystalCount = 25000;
            var crystalCountItemP = document.getElementById("crystalCountItemP");
            var itemSize = tileSize/2;
            var friction = {x:0.9, y:0.9};
            let gravity = {x:0, y:0.5};
            var bulletSize = (tileSize * 2) / 1.2;
            var gameCycles = 0;
            let playerStartCoords = {x:tileSize * 2,y:tileSize*2};
            let fpsCount = setInterval( ()=>{
                console.log("FPS: " + gameCycles);
                gameCycles = 0;
            }, 1000);
            crystalCountItemP.innerHTML = crystalCount;
            var level = 1; //the level the player is on
            
            function slideVolume(id){
               document.getElementById("volumeSliderDiv").querySelector("P").innerHTML = "Volume: " + id.value;
               masterVolume = id.value/100;
            }
         
            function hidePage(page, hide){
               
                page.hidden = hide;
            }
            
            function startUpWorld(){
              
                world.map = world[1];
                
                if(loadedState){
                    loop();
                }
                
                backgroundColor = "#536dfe";
                player.x = playerStartCoords.x;
                player.y = playerStartCoords.y;
                
                viewport.oldplayerY = viewport.getPlayerY();
                viewport.oldplayerX =  viewport.getPlayerX();
                
            };
            
            function changeWorld(worldChosen){
               
                
                if(worldChosen == world.overWorld){
                    backgroundColor = "#536dfe";
                }else{
                    backgroundColor = "#202020";
                }
                
               
                let wh;
                for(gh in world.map.tileModders){
                    console.log(world.map.tileModders[gh].layer);
                    
                    for(wh = 0; wh < world.map.tileModders[gh].length; wh++){
                        world.map[world.map.tileModders[gh][wh].layer][world.map.tileModders[gh][wh].targetTileId] = "***";
                        world.map.collisionLayer[world.map.tileModders[gh][wh].targetTileId] = "000";
                    }
                }
                
                world.map = worldChosen;
                bullets = [];
                mobBullets = [];
                
                
            };
        
            var Animation = function(frame_set, delay){
            //Poth on Programming stuff with some slight modifications
                this.count = 0;// Counts the number of game cycles since the last frame change.
                this.delay = delay;// The number of game cycles to wait until the next frame change.
                this.frame = 0;// The value in the sprite sheet of the sprite image / tile to display.
                this.frame_index = 0;// The frame's index in the current animation frame set.
                this.frame_set = frame_set;// The current animation frame set that holds sprite tile values.
            };
           
            Animation.prototype = {
                change:function(frame_set, delay = 15){
                    if (this.frame_set != frame_set) {// If the frame set is different:
             
                if(controller.clickAnim){
                    
                    setTimeout( () => {
                        this.count = 0;// Reset the count.
                        this.delay = delay;// Set the delay.
                        this.frame_index = 0;// Start at the first frame in the new frame set.
                        this.frame_set = frame_set;// Set the new frame set.
                        this.frame = this.frame_set[this.frame_index];// Set the new frame value.
                        
                        controller.clickAnim = false;
                        
                    }, 150 );
                    return;
                }
                
                    
                this.count = 0;// Reset the count.
                this.delay = delay;// Set the delay.
                this.frame_index = 0;// Start at the first frame in the new frame set.
                this.frame_set = frame_set;// Set the new frame set.
                this.frame = this.frame_set[this.frame_index];// Set the new frame value.
               
               
              }
        
                },
                update:function(){
                
        
                this.count ++;// Keep track of how many cycles have passed since the last frame change.
            
              if (this.count >= this.delay) {// If enough cycles have passed, we change the frame.
               
                this.count = 0;// Reset the count.
                /* If the frame index is on the last value in the frame set, reset to 0.
                If the frame index is not on the last value, just add 1 to it. */
                this.frame_index = (this.frame_index == this.frame_set.length - 1) ? 0 : this.frame_index + 1;
                this.frame = this.frame_set[this.frame_index];// Change the current frame value.
        
              }
                    
                }
            };
            
            var Sound = function(src){
                this.sound = document.createElement("audio");
                this.sound.src = src;
                this.sound.setAttribute("preload", "auto");
                this.sound.setAttribute("controls", "none");
                this.sound.style.display = "none";
                document.body.appendChild(this.sound);
                this.play = function(){
                    this.sound.play();
                }
                this.stop = function(){
                    this.sound.pause();
                }   
                this.playTimed = function(msec, playbackRate, volume = masterVolume){
                    this.sound.playbackRate = playbackRate;
                    this.sound.volume = volume;
                    this.sound.play();
                    setTimeout( () => {
                        this.sound.pause();
                        this.sound.currentTime = 0;
                        this.sound.playbackRate = 1;
                        this.sound.volume = 1;
                    }, msec);
                    
                   
                }
                this.playLoop = function(playbackRate = 1, volume = masterVolume){
                    this.sound.volume = volume;
                    this.sound.loop = true;
                    this.sound.playbackRate = playbackRate;
                    this.sound.play();
                }
                
            };
            
            var logScrapeOnBoulder = new Sound("https://www.youtube.com/audiolibrary_download?vid=d73e7f8efd2a613d");
            var woodenSticks = new Sound("https://www.youtube.com/audiolibrary_download?vid=2d7485c24014118f");
            var monumentalJourney = new Sound("https://www.youtube.com/audiolibrary_download?vid=cffcb5e7e8630c59");
            var walkDirt = new Sound("");
            var springDayForest = new Sound("https://www.youtube.com/audiolibrary_download?vid=e9cd69a66c773134");
            
            var cloudWheelsCastleBuilder = new Sound("https://www.youtube.com/audiolibrary_download?vid=cfe0f9e993b51fd9");
            var walkingOnStoneFloor = new Sound("https://www.youtube.com/audiolibrary_download?vid=02e36a87b0adc8b0");
            var buttonPush = new Sound("https://www.youtube.com/audiolibrary_download?vid=ad52ac00e6be0ecb");
            //https://www.zapsplat.com/?s=blip&post_type=music&sound-effect-category-id=
            /*var sound = new Sound("src");
            var sound = new Sound("src");
            var sound = new Sound("src");
            var sound = new Sound("src");
        */  
            
             var Timer = function(delay, long){
                this.count = 0;
                this.delay = delay;
                this.long = long;
            };
            
            Timer.prototype = {
                run:function(){
                    
                    this.count++;
                    if(this.count >= this.delay){
                        this.count = 0;
                    }
                    
                    
                    
                },
                update:function(){
                    this.count++;
                
                if(this.count >= this.delay){
                    //this.count = 0;
                }
                    
                
                },
            };
            
            player_sheetFrames = [[1,2,3,2], [4,5,6,5],[7,8,9,10],[11,12, 13, 14],[16],[15],[0, 19]];
             
            const Bullet = function(x, y, d, r, vx, vy,  bulletSizes = bulletSize, dmg = 10, hueRotateDeg = 0,  ox, oy ) {
                    
                        this.x = x; this.y = y; this.d = d; this.r = r; this.vx = -1  + vx/10; this.vy = 1  + vy/10; this.ox = ox; this.oy = oy; this.bulletSizes = bulletSizes; this.dmg = dmg;
                        this.collisionPoint = {x:this.x, y:this.y};
                        this.hueRotateDeg = hueRotateDeg;
                        
        
                        if(Math.abs(this.vx) < 5 || Math.abs(this.vy) < 5){
                            this.vx *= 6;
                            this.vy *= 6;
                            
                        } else if (Math.abs(this.vx) > 30 || Math.abs(this.vy) > 30) {
                            this.vx /= Math.abs(this.vx) - 10;
                            this.vy /= Math.abs(this.vx) - 10;
                            
                        }
                        
                       
               
        
            }; 
                    
            const Item = function(x, y, w, h, use, sx, sy, stackSize){
                this.x = x;
                this.y = y;
                this.w = w;
                this.h = h;
                this.vx = 0;
                this.vy = 0;
                this.sx = sx;
                this.sy = sy;
                this.use = use;
                this.itemColumn = null;
                this.itemRow = null;
                this.tileCoords = null;
                //this.distanceFromVictim = 100000;
                this.color = Math.floor(Math.random() * 200);
                if(stackSize !== undefined){
                 this.stackSize = stackSize;
                }else{
                  this.stackSize = this.getStackSize();  
                }
            };
            
            Item.prototype = {
                draw:function(){
                    
                    context.drawImage(item_sheet, this.sx, this.sy, 32, 32, this.x - viewport.x, this.y - viewport.y, this.w,this.h);
                    
                    
                   
                },
                getStackSize:function(){
                   
                    switch(this.use){
                            case "healthPotion": 
                               return 1;
                            break;
                            case "speedPotion": 
                                return 1;
                            break;
                            case "slimeBall": 
                                return 4;
                            break;
                            case "bone": 
                                return 4;
                            break;
                            default: return 1;
                            break;
                        }
                        
                        
                    
                },
                distanceFromVictim:function(){
                          return Math.sqrt( Math.pow( (this.x + this.w/2) - player.centerX, 2) + Math.pow( (this.y + this.h/2) - player.centerY, 2) );
        
                },
                update:function(){
                    
                    this.xv *= 0.9;
                    this.yv *= 0.9;
                    
                    this.x += this.vx;
                    this.y += this.vy;
                    
         
                    
                    
                    
                },
                collision:function(entity, itemArrayValue){
                    
                    if(viewport.getPlayerX() > this.x && viewport.getPlayerX() < this.x + this.w && viewport.getPlayerY() > this.y && viewport.getPlayerY() < this.y + this.h){
                              
                             
                              
                              return true;
                                
                    } else if(viewport.getPlayerX() + player.hitBoxWidth > this.x && viewport.getPlayerX() + player.hitBoxWidth < this.x + this.w && viewport.getPlayerY() + player.hitBoxHeight> this.y && viewport.getPlayerY() + player.hitBoxHeight< this.y + this.h){
                               
                               
                               
                               return true;
                                
                                
                                //Could make sword attack false to make it one hit damage type
                                
                            }
                    
                    this.itemColumn = Math.floor((this.x + this.w*0.5) / tileSize);
                    this.itemRow = Math.floor((this.y + this.h*0.5) / tileSize);
                    this.tileCoords = this.itemRow * world.map.columns + this.itemColumn;
                        
                    
                    
                    if(world.map.collisionLayer[this.tileCoords] != "000" && world.map.collisionLayer[this.tileCoords] != "010" || world.map.layout[this.tileCoords] == "***"){
                        
                        
                        
                    
                        let po;
                        for(po = -10; po < 10; po++){
                            
                            
                            if(world.map.collisionLayer[this.tileCoords + po] == "000" && world.map.layout[this.tileCoords] != "***"){
                                this.x += tileSize * po;
                                this.w = 100;
                                
                                return;
                            }
                            if(world.map.collisionLayer[po * world.map.columns + this.tileCoords] == "000" || world.map.layout[this.tileCoords] != "***"){
                                this.y += tileSize * po;
                                this.h=100;
                                
                                return;
                            }
                            
                        }
                        
                      this.x = 190000000;
                      this.y = 10993933939393939393993939393;
                        
                        
                    }
                    
                },
            };
                    
            const Inventory = function(x, y, w, h, xv, yv){
                this.x = x;
                this.y = y;
                this.w = w;
                this.h = h;
                this.xv = xv;
                this.yv = yv;
                this.inventoryData = [];
                this.inventoryLength = 5;
                this.inventoryLengthLvl = 1;
                this.inventorySlot = 0;
                this.inventoryAppearanceSize = width/17; //40      width/17
               
        
            };
            
            Inventory.prototype = {
                draw:function(){
                  
                  let lineWidthOutline = Math.floor(this.inventoryAppearanceSize/15);
                 
                  // context.fillRect(context.canvas.width - 160,0,40*this.inventoryData.length,40);
                   
                   for(let t = 0; t < this.inventoryData.length; t++){
                       
                       var ranColor = this.inventoryData[t][0].color;
                       
                       
                       if(ranColor > 150){
                           context.fillStyle = "blue";
                       }else if(ranColor < 70){
                           context.fillStyle = 'green';
                       }else{
                           context.fillStyle = 'violet';
                       }
                        
                       
        
                       context.fillRect(context.canvas.width - (this.inventoryAppearanceSize*this.inventoryLength) + (t*this.inventoryAppearanceSize) ,lineWidthOutline/2,this.inventoryAppearanceSize,this.inventoryAppearanceSize);
                        
                       context.drawImage(item_sheet, this.inventoryData[t][0].sx, this.inventoryData[t][0].sy, 32, 32, context.canvas.width - (this.inventoryAppearanceSize*this.inventoryLength) + (t*this.inventoryAppearanceSize) , lineWidthOutline/2, this.inventoryAppearanceSize, this.inventoryAppearanceSize);
        
                       context.drawImage(item_sheet, this.inventoryData[t][0].sx, this.inventoryData[t][0].sy, 32, 32, context.canvas.width - (this.inventoryAppearanceSize*this.inventoryLength) + (t*this.inventoryAppearanceSize) , lineWidthOutline/2, this.inventoryAppearanceSize, this.inventoryAppearanceSize);
        
                        if(this.inventoryData[t].length == this.inventoryData[t][0].stackSize){
                            context.fillStyle = "#d9d925";
                        }else{
                        context.fillStyle = "#FFFFFF";
                        }
                        
                         let fontScale = this.inventoryAppearanceSize/3;
                        context.font = fontScale + "px Geo";
                        context.fillText(this.inventoryData[t].length, context.canvas.width - (this.inventoryAppearanceSize*this.inventoryLength) + (t*this.inventoryAppearanceSize) + this.inventoryAppearanceSize/1.25, lineWidthOutline/3 + this.inventoryAppearanceSize/1.08 );
                        
                   }
                  
                    context.strokeStyle = "#FFFFFF";
                   context.lineWidth = lineWidthOutline;
                   context.strokeRect(context.canvas.width - (this.inventoryAppearanceSize*this.inventoryLength) + (this.inventorySlot*this.inventoryAppearanceSize), lineWidthOutline/2, this.inventoryAppearanceSize, this.inventoryAppearanceSize);
                   //context.fillRect(0,0,width,1);
                    context.lineWidth = 1;
                    
                   
                    
                 
                
                    //DRAWS CRYSTAL COUNTER BELOW
                    // context.font = "50px Geo";
                 //    context.drawImage(item_sheet, 33 * 14, 0, 32, 32, 10, 22, 32,32);
                  //   context.fillText(crystalCount, 50, 50);
        
        
        
                   
        
                },
                update:function(){
                  
                },
                collision:function(entity){
                    
                },
                pickUpItem:function(sprite, arrayValue){
                     
                     
                     if(sprite.use == "gem" && sprite.collision(player) ){
                                  crystalCount++;
                                  crystalCountItemP.innerHTML = crystalCount;
                                  items.splice(arrayValue, 1);
                                  return;
                    }
                    
                               
                    
                    if( sprite.collision(player) ){
                        for(let b = 0; b < this.inventoryData.length; b++){
                            if(sprite.use == this.inventoryData[b][0].use && this.inventoryData[b].length < sprite.stackSize){
                                
                                this.inventoryData[b].push(sprite);
                      
                                items.splice(arrayValue,1);
                                return;
                                
                            }
                        }
                    }
                    
                    if(sprite.collision(player) && this.inventoryLength > this.inventoryData.length){
                       
                       this.inventoryData[this.inventoryData.length] = [];
                       this.inventoryData[this.inventoryData.length-1].push(sprite);
                      
                       items.splice(arrayValue,1);
        
                       
                    }
                    
                    
                },
                dropItem:function(itemArrayValue, locX, locY){
                   
                    if(controller.spacebar && this.inventoryData[itemArrayValue] !== undefined && !player.inDialogue){
                       
                    var item = this.inventoryData[itemArrayValue].splice(0,1);
                    
                    let throwDir = Math.floor(Math.random() * (1 + 2 + 1) ) - 2;    
                        item[0].x = locX += (throwDir*player.hitBoxWidth * 0.7);
                        item[0].y = locY + Math.floor(Math.random() * (5 - 3 + 5) ) + 3;
                        const falL = item[0].y;
                        
                        
                        
                        var waka = setInterval(() => {
                            item[0].vy+=0.2;
                            item[0].update();
                            if(item[0].y > falL+player.hitBoxHeight/2){
                           clearInterval(waka);
                           item[0].vy = 0;
                           //item[0].y--;
                           
                            }
                            
                        }, 10);
                        
                        
                     if(this.inventoryData[itemArrayValue][0] == undefined ){
                         
                         this.inventoryData.splice(itemArrayValue,1);
                         
                     }
                            
                        
                        
                        items.push(item[0]);
                        
                        
                        
                        controller.spacebar = false;
                        
                    } 
                },
                use:function(){
                   
                    if(controller.q && this.inventoryData.length > 0 && this.inventoryData[this.inventorySlot] !== undefined){
               // this.inventoryData[this.inventorySlot].use.use();
                        switch(this.inventoryData[this.inventorySlot][0].use){
                            case "healthPotion": 
                                player.health+=200;
                                this.inventoryData[this.inventorySlot].splice(0, 1);
                            break;
                            case "speedPotion": 
                                player.speed*=2;
                                this.inventoryData[this.inventorySlot].splice(0, 1);
                            break;
                            default:
                            break;
                        }
                        
                         if(this.inventoryData[this.inventorySlot][0] == undefined ){
                         
                         this.inventoryData.splice(this.inventorySlot,1);
                         
                         }
                        
                        
                        
                        
                        controller.q = false;
                        
                    }
        
                },
                selectSlot:function(){
                  
                    if(controller[1]){
                        this.inventorySlot = 0;
                        //healthPotion.use();
                        items.push(new Item(controller.mouseX + viewport.x,controller.mouseY + viewport.y,20,20, "healthPotion", 99, 0));
                        
                        controller[1] = false;
                        
                    }else if(controller[2]){
                        this.inventorySlot = 1;
                        
        
                    }else if(controller[3]){
                        this.inventorySlot = 2;
                        controller[3] = false;
               
                    }else if(controller[4]){
                        this.inventorySlot = 3;
                        controller[4] = false;
                        
                    }else if(controller[5]){
                        this.inventorySlot = 4;
                        controller[5] = false;
                        
                    }else if(controller[6]){
                        this.inventorySlot = 5;
                        controller[6] = false;
                        
                    }else if(controller[7]){
                        this.inventorySlot = 6;
                        controller[7] = false;
                        
                    }
               
                },
            };
            
            Bullet.prototype = {
        
                        updatePosition:function() {
                            
                           
                            
                            this.x += Math.cos(this.r)*this.d;
                            this.y += Math.sin(this.r)*this.d;
                            
                           
                 
                        
                            //this.x += this.vx;
                           // this.y += this.vy;
                        },
                        collision:function(index, array){
                               //var valueAtIndexStr = world.map.collisionLayer[bottomRow * world.map.columns +leftColumn];
                        this.collisionPoint.x = ( -Math.cos(this.r + Math.PI)*(bulletSize/3.7) + this.x);
                        this.collisionPoint.y = ( -Math.sin(this.r + Math.PI)*(bulletSize/3.7) + this.y);
        
                        let column = Math.floor(( this.collisionPoint.x ) / world.tileSize );
                        let row = Math.floor((this.collisionPoint.y ) / world.tileSize);
                        
                        
                            
                        
                        if(world.map.collisionLayer[row * world.map.columns + column] != "000"){
                            array.splice(index, 1);
                            
                           
                           return true;
                        }
                        
                        return false;
                        },
        
            };

            class Player{
                constructor(){
                    this.animation = new Animation();
                    //this.set x(value){viewport.x = value - ( ( (viewport.w*0.5) - (player.width/2) ) + player.hitBoxXSpace ) ;}; //(viewport.x + (viewport.w * 0.5) - player.width/2) + player.hitBoxXSpace;
                    //this.set y(value){viewport.y = value - ( ( (viewport.h*0.5) - (player.height/2) ) + player.hitBoxYSpace ) ;};  
                    //this.set x_velocity(value){viewport.xv = value;};
                    //this.set y_velocity(value){viewport.yv = value;};
                    //this.set old_x(value){viewport.ox = value - ( ( (viewport.w*0.5) - (player.width/2) ) + player.hitBoxXSpace );};
                    //this.set old_y(value){viewport.oy = value - ( ( (viewport.h*0.5) - (player.height/2) ) + player.hitBoxYSpace ) ;};
                    //this.get offsetWidth(){return 0};
                    //this.get offsetHeight(){return 0};
                    this.width =  world.tileSize+8;  //48       40
                    this.height =  world.tileSize+8; //48       40 recent-est
                    this.normWidth = world.tileSize+8; //can't put width or height here; put just the exact value
                    this.normHeight = world.tileSize+8;
                    this.health =  300;
                    this.maxHealth =  300;
                    this.deathState = false;
                    this.healthLvl =  1;
                    this.bounciness =  2;
                    this.jumpSpeed = 25;
                    this.canJump = [true, true,]; //Each item is one extra jump
                    this.jumpReady = true; //Stop the player from holding jump button and use up all their jumps instantly
                    //this.get hitBoxWidth(){return this.width;};
                    //this.get hitBoxHeight(){return this.height;};
                    //this.get hitBoxX(){return this.realX;}; //Best not to touch these
                    //this.get hitBoxY(){return this.realY;};
                    //this.get hitBoxYSpace(){return 0;};
                    //this.get hitBoxXSpace(){return 0;};
                    this.speed = 0.5;
                    this.speedLvl =  1;
                    this.bulletSpeed = 1;
                    this.bulletSpeedLvl = 1;
                    this.bulletDamage = 20;
                    this.bulletKnockback = 1.5;
                    this.bulletDamageLvl = 1;
                    this.lightningBow = false;
                    this.lightningBowLvl = 1;
                    this.inDialogue = false;
                    this.realX =  context.canvas.width/2 - this.width/2 - this.hitBoxXSpace;
                    this.realY =  context.canvas.height/2 - this.height/2 - this.hitBoxYSpace; //This is the real physical coordinates of the character; however these should ever so rarely change as only the camera moves.
                    this.inventory = new Inventory();
                    this.questInventory = [];
                    //this.get bottom() {return viewport.getPlayerY() + (this.hitBoxHeight)};
                    //this.get oldBottom() {return viewport.oldplayerY + (this.hitBoxHeight)};
                    //this.get top(){ return viewport.getPlayerY()};
                    //this.get oldTop(){ return viewport.oldplayerY};
                    //this.get right(){ return viewport.getPlayerX() + (this.hitBoxWidth)};
                    //this.get oldRight(){ return viewport.oldplayerX + (this.hitBoxWidth) };
                    //this.get left(){ return viewport.getPlayerX() };
                    //this.get oldLeft(){ return viewport.oldplayerX};
                    //this.get centerX(){ return this.left + this.hitBoxWidth/2};
                    //this.get centerY(){ return this.top + this.hitBoxHeight/2};
             
                }

                interact(){}
            }
                    
            player1 = function(){
                    
            }
            
            player1.prototype.interact = function(){
                
                let x;

                 //So the user does not use up all their jumps in one keypress (makes it so the player has to stop pressing the jump key before he can jump again)
                if(!controller.w && !controller.up){
                    player.jumpReady = true;
                }
               
                if(controller.e){
                   
                    controller.e = false;
                    viewport.yv -= player.jumpSpeed;

                }
                
                player.inventory.selectSlot();
                player.inventory.use();
                player.inventory.dropItem(player.inventory.inventorySlot, player.left + player.hitBoxWidth/2, player.bottom);
                 
                if(controller.up && controller.right && player.jumpReady){
                    player.animation.change(player_sheetFrames[3], 6);
                    
                    for(let x = 0; x < player.canJump.length; x++){
                        if(player.canJump[x]){
                            viewport.xv += player.speed;
                            viewport.yv -= player.jumpSpeed;
                            player.canJump[x] = false;
                            //So all jumps are not used instantly
                            player.jumpReady = false;
        
                            break;
                        }
                    }
                    return;
                }
                
                if(controller.up && controller.left && player.jumpReady){
                    player.animation.change(player_sheetFrames[3], 6);
                    for(let x = 0; x < player.canJump.length; x++){
                        if(player.canJump[x]){
                            viewport.xv -= player.speed;
                            viewport.yv -= player.jumpSpeed;
                            player.canJump[x] = false;
                            //So all jumps are not used instantly
                            player.jumpReady = false;
        
                            break;
                        }
                    }
                    return;
                }
                
                if(controller.down && controller.right){
                    player.animation.change(player_sheetFrames[2], 6);
                    viewport.xv+=player.speed;
                    return;
                }
                
                if(controller.down && controller.left){
                    player.animation.change(player_sheetFrames[2], 6);
                    viewport.xv-=player.speed;
                    return;
                }
               
                if(controller.right){
                   
                    player.animation.change(player_sheetFrames[1],5);
                    viewport.xv+=player.speed;
                    return;
                }
                if(controller.left){
                   // player.x_velocity-=player.speed;
                    player.animation.change(player_sheetFrames[0], 5);
                    viewport.xv-=player.speed;
                    return;
        
                }
                if(controller.up && player.jumpReady){
                    //player.y_velocity-=player.speed;
                    player.animation.change(player_sheetFrames[3], 6);
                    for(let x = 0; x < player.canJump.length; x++){
                        if(player.canJump[x]){
                            viewport.xv += player.speed;
                            viewport.yv -= player.jumpSpeed;
                            player.canJump[x] = false;
                            //So all jumps are not used instantly
                            player.jumpReady = false;
        
                            break;
                        }
                    }
                    return;
                    
                }
                if(controller.down){
                    //player.y_velocity+=player.speed;
                    player.animation.change(player_sheetFrames[2], 6);
                    return;
                }
                
                if(controller.w && controller.d && player.jumpReady){
                    player.animation.change(player_sheetFrames[3], 6);
                    for(let x = 0; x < player.canJump.length; x++){
                        if(player.canJump[x]){
                            viewport.xv += player.speed;
                            viewport.yv -= player.jumpSpeed;
                            player.canJump[x] = false;
                            //So all jumps are not used instantly
                            player.jumpReady = false;
        
                            break;
                        }
                    }
                    return;
                }
                
                if(controller.w && controller.a && player.jumpReady){
                    player.animation.change(player_sheetFrames[3], 6);
                    for(let x = 0; x < player.canJump.length; x++){
                        if(player.canJump[x]){
                            viewport.xv -= player.speed;
                            viewport.yv -= player.jumpSpeed;
                            player.canJump[x] = false;
                            //So all jumps are not used instantly
                            player.jumpReady = false;
        
                            break;
                        }
                    }
                    return;
                }
                
                if(controller.s && controller.d){
                    player.animation.change(player_sheetFrames[2], 6);
                    viewport.xv+=player.speed;
                    return;
                }
                
                if(controller.s && controller.a){
                    player.animation.change(player_sheetFrames[2], 6);
                    viewport.xv-=player.speed;
                    return;
                }
                
                if(controller.d){
                    //player.x_velocity+=player.speed;
                    player.animation.change(player_sheetFrames[1],5);
                    viewport.xv+=player.speed;
                    return;
                }
                if(controller.a){
                   // player.x_velocity-=player.speed;
                    player.animation.change(player_sheetFrames[0], 5);
                    viewport.xv-=player.speed;
                    return;
                }
                if(controller.w && player.jumpReady){
                    //player.y_velocity-=player.speed;
                    player.animation.change(player_sheetFrames[3], 6);
                    for(let x = 0; x < player.canJump.length; x++){
                        if(player.canJump[x]){
                            viewport.yv -= player.jumpSpeed;
                            player.canJump[x] = false;
                            //So all jumps are not used instantly
                            player.jumpReady = false;

                            break;
                            
                        }
                    }
                    return;
        
                }
                if(controller.s){
                   // player.y_velocity+=player.speed;
                    player.animation.change(player_sheetFrames[2], 6);
                    return;
                }
                
                if(!controller.w &&!controller.a &&!controller.s &&!controller.d &&!controller.up &&!controller.down &&!controller.left &&!controller.right && !controller.click && !controller.clickAnim){
                    player.animation.change(player_sheetFrames[6], 24);
                    
                }
                
        
            };
            
            player1.prototype.draw = function() {
                context.fillStyle="#FFFFFF";
                context.fillRect(player.hitBoxX, player.hitBoxY, player.hitBoxWidth, player.hitBoxheight);
                context.fillRect(player.realX, player.realY, player.width, player.height);

                //context.fillRect(player.realX + player.width/3.4, player.realY + (player.height/5.3), player.width*0.35, player.height * 0.55);
                context.fillStyle = "#1adb92";
                //context.fillStyle="#17bf7f";
                context.fillRect((context.canvas.width/2) - ((player.health*(context.canvas.width/490))/2),  context.canvas.height/1.1 + (context.canvas.height/400),   player.health*(context.canvas.width/490),    context.canvas.height/50 - (context.canvas.height/200) );
                //context.fillRect(player.realX, player.realY, player.width, player.width/3.4);
                context.fillStyle = "#1adb92";
                context.fillRect((context.canvas.width/2) - ((player.health*(context.canvas.width/500))/2), context.canvas.height/1.1, player.health*(context.canvas.width/500), context.canvas.height/50);
                context.fillStyle="#17bf7f";
                context.fillRect((context.canvas.width/2) - ((player.health*(context.canvas.width/500))/2), context.canvas.height/1.1 + (context.canvas.height/50), player.health*(context.canvas.width/500), -context.canvas.height/150);
            
                context.fillStyle="#FFFFFF";
            // context.fillRect(player.hitBoxX, player.hitBoxY, player.hitBoxWidth, player.hitBoxHeight);
                
            
              };
            
            player1.prototype.death = function() {
                player.health = 9999999000000000000000000000000000;
                player.x_velocity = 0;
                player.y_velocity = 0;
                let E = 100;
                let speeD = 5;
        
                let bana = setInterval( ()=>{
                    E-=speeD;
                    
                    if(E <= 0){
                        player.health = player.maxHealth;
                        player.width = player.normWidth;
                        player.height = player.normHeight;
                        if(typeof world.map.respawnCoords.worldToSpawnTo !== "undefined"){
                            world.map = world.map.respawnCoords.worldToSpawnTo;
                            //changeWorld(world.map);
                        }
                        player.x = world.map.respawnCoords.x;
                        player.y = world.map.respawnCoords.y;
                        player.deathState = false;
                                
                      
                        speeD*=-1;
                        
                    }
                    if(speeD < 1 && E >= 100){
                        clearInterval(bana);
                    }
                    
                   context.canvas.style.filter = "brightness(" + E + "%)";
        
                    
                }, 50);
              
                
            };
            
            player1.prototype.update = function() {
               
               if(player.health <= 0){
                   this.death();
                   
               }
               if(player.health > player.maxHealth){
                   player.health = player.maxHealth;
               }
                 
                   //player movement
                //Changes ViewportOldTileSpeed to present one
                viewport.oldplayerY = viewport.getPlayerY();
                viewport.oldplayerX = viewport.getPlayerX();
                //Changes old x, y pos to present one
                viewport.ox = viewport.x;
                viewport.oy = viewport.y;
                //Applies friction to player
                    // player.x_velocity *= 0.9;
                    // player.y_velocity *= 0.9;
                //applies velocity to the player position
                //player.x+=viewport.xv;
                //player.y+=viewport.xy;
                //Applies friction to viewport.xv position
                viewport.xv *= friction.x;
                viewport.yv *= friction.y;

                viewport.yv += gravity.y;

                //Applies velocity to the viewport's position
                viewport.x += viewport.xv;
                viewport.y += viewport.yv;
                //Changes the viewport to match the size of the canvas
                viewport.w = context.canvas.width;
                viewport.h = context.canvas.height;
                //Changes player real Position to remain centered
                player.realX = (context.canvas.width/2) - (player.width/2);
                player.realY = (context.canvas.height/2) - (player.height/2);
                
                 
               // player.x = 100;
                
               
                //To fix panning resize thing, make player loc fixed while it is being moved;
                
            
                
            };
           
            player1.prototype.collision = function(){
                        
                var startingCorner = world.map.columns * world.tileSize - viewport.x - viewport.w;
                //make these values more accurate though pretty good
                
                //Best One So Far
                var leftColumn = Math.floor(( (player.left) / world.tileSize ));
                var rightColumn =  Math.floor(( (player.right) / world.tileSize));
                var topRow = Math.floor(( (player.top) / world.tileSize ));
                var bottomRow = Math.floor(( (player.bottom ) / world.tileSize ));
            
                context.beginPath();
                context.fillText(Math.floor(topRow * world.map.columns + leftColumn), 400,200);
                context.fill();
                             
               if(viewport.x - viewport.ox < 0){
                   var valueAtIndexStr = world.map.collisionLayer[bottomRow * world.map.columns + leftColumn];
                   var valueAtIndex = Number(valueAtIndexStr);
                    
                    
                    if(valueAtIndex != 0){
                        //bottom left -x
                      collision[valueAtIndex](player,bottomRow,leftColumn);
                    }
                    
                        
                     var valueAtIndexStr = world.map.collisionLayer[topRow * world.map.columns +leftColumn];
                   var valueAtIndex = Number(valueAtIndexStr);
                    
                    if(valueAtIndex != 0){
                        //top left -x
                      collision[valueAtIndex](player,topRow,leftColumn);
                    }
                    
               } else if (viewport.x - viewport.ox > 0){
                    var valueAtIndexStr = world.map.collisionLayer[bottomRow * world.map.columns +rightColumn];
                   var valueAtIndex = Number(valueAtIndexStr);
                       
                    if(valueAtIndex != 0){
                        //bottom right +x
                      collision[valueAtIndex](player,bottomRow,rightColumn);
                    }
                    
                     var valueAtIndexStr = world.map.collisionLayer[topRow * world.map.columns +rightColumn];
                   var valueAtIndex = Number(valueAtIndexStr);
                    
                    if(valueAtIndex != 0){
                        //top right +x
                      collision[valueAtIndex](player,topRow,rightColumn);
                    }
                    
               }
               
               if(viewport.y - viewport.oy < 0){
                    //Going up
                    var valueAtIndexStr = world.map.collisionLayer[topRow * world.map.columns + rightColumn];
                    var valueAtIndex = Number(valueAtIndexStr);
                            
                    if(valueAtIndex != 0){
                        //top right -y
                        collision[valueAtIndex](player,topRow,rightColumn);
                    }
                    
                    var valueAtIndexStr = world.map.collisionLayer[topRow * world.map.columns + leftColumn];
                    var valueAtIndex = Number(valueAtIndexStr);
        
                    //Top Left point
                    if(valueAtIndex != 0){
                        //top left -y
                       collision[valueAtIndex](player,topRow,leftColumn);
                    }
         
               } else if (viewport.y - viewport.oy > 0){
                   //Going Down
                   
                   
                     var valueAtIndexStr = world.map.collisionLayer[bottomRow * world.map.columns + rightColumn];
                    var valueAtIndex = Number(valueAtIndexStr);
                    
                    if(valueAtIndex != 0){
                       //bottom right +y

                       collision[valueAtIndex](player,bottomRow,rightColumn);
                    }
        
                    var valueAtIndexStr = world.map.collisionLayer[bottomRow * world.map.columns + leftColumn];
                    var valueAtIndex = Number(valueAtIndexStr);
        
                    //Top Left point
                    if(valueAtIndex != 0){
                        //bottom left +y
                       collision[valueAtIndex](player,bottomRow,leftColumn);
                    }
                   
               }
               
            };

           

            player = {
                animation:new Animation(),
                set x(value){viewport.x = value - ( ( (viewport.w*0.5) - (player.width/2) ) + player.hitBoxXSpace ) ;}, //(viewport.x + (viewport.w * 0.5) - player.width/2) + player.hitBoxXSpace;
                set y(value){viewport.y = value - ( ( (viewport.h*0.5) - (player.height/2) ) + player.hitBoxYSpace ) ;},  
                set x_velocity(value){viewport.xv = value;},
                set y_velocity(value){viewport.yv = value;},
                set old_x(value){viewport.ox = value - ( ( (viewport.w*0.5) - (player.width/2) ) + player.hitBoxXSpace );},
                set old_y(value){viewport.oy = value - ( ( (viewport.h*0.5) - (player.height/2) ) + player.hitBoxYSpace ) ;},
                get offsetWidth(){return 0},
                get offsetHeight(){return 0},
                width: world.tileSize/2,  //48       40
                height: world.tileSize/2, //48       40 recent-est
                normWidth:world.tileSize/2, //can't put width or height here, put just the exact value
                normHeight:world.tileSize/2,
                health: 300,
                maxHealth: 300,
                deathState:false,
                healthLvl: 1,
                bounciness: 2,
                jumpSpeed:25,
                canJump:[true, true,], //Each item is one extra jump
                jumpReady:true, //Stop the player from holding jump button and use up all their jumps instantly
                get hitBoxWidth(){return this.width;},
                get hitBoxHeight(){return this.height;},
                get hitBoxX(){return this.realX;}, //Best not to touch these
                get hitBoxY(){return this.realY;},
                get hitBoxYSpace(){return 0;},
                get hitBoxXSpace(){return 0;},
                speed:0.5,
                defaultSpeed:0.5,
                speedLvl: 1,
                bulletSpeed:1,
                bulletSpeedLvl:1,
                bulletDamage:20,
                bulletKnockback:1.5,
                bulletDamageLvl:1,
                lightningBow:false,
                lightningBowLvl:1,
                inDialogue:false,
                realX: context.canvas.width/2 - this.width/2 - this.hitBoxXSpace,
                realY: context.canvas.height/2 - this.height/2 - this.hitBoxYSpace, //This is the real physical coordinates of the character, however these should ever so rarely change as only the camera moves.
                inventory:new Inventory(),
                questInventory:[],
                get bottom() {return viewport.getPlayerY() + (this.hitBoxHeight)},
                get oldBottom() {return viewport.oldplayerY + (this.hitBoxHeight)},
                get top(){ return viewport.getPlayerY()},
                get oldTop(){ return viewport.oldplayerY},
                get right(){ return viewport.getPlayerX() + (this.hitBoxWidth)},
                get oldRight(){ return viewport.oldplayerX + (this.hitBoxWidth) },
                get left(){ return viewport.getPlayerX() },
                get oldLeft(){ return viewport.oldplayerX},
                get centerX(){ return this.left + this.hitBoxWidth/2},
                get centerY(){ return this.top + this.hitBoxHeight/2},
    
            };

            player.normWidth = player.width;
            player.normHeight = player.height;
                
            var Viewport = function(x, y, w, h, yv, xv){
                this.x = x;
                this.y = y;
                this.w = w;
                this.h = h;
                this.yv = yv;
                this.xv = xv;
                this.ox = x;
                this.oy = y;
                this.getPlayerY =  function(){return (this.y + (this.h * 0.5) - (player.height/2) ) + player.hitBoxYSpace;}; //in game coords
                this.getPlayerX =  function(){return (this.x + (this.w * 0.5) - (player.width/2) ) + player.hitBoxXSpace;}; //in game coords
                this.oldPlayerY = (this.y + (this.h * 0.5) - (player.height/2) ) + player.hitBoxYSpace; //in game coords
                this.oldPlayerX =  (this.x + (this.w * 0.5) - (player.width/2) ) + player.hitBoxXSpace; //in game coords
               
                
                //realX: context.canvas.width/2 - this.width/2 - this.hitBoxXSpace,
            }
            
            var viewport = new Viewport(0, 0, context.canvas.width, context.canvas.height, 0, 0);
                    
            controller = {
                dialogueButtonState:undefined,
                down:false,
                left:false,
                right:false,
                up:false,
                mouseX:0,
                mouseY:0,
                w:false,
                a:false,
                s:false,
                d:false,
                e:false,
                q:false,
                r:false,
                1:false,
                2:false,
                3:false,
                4:false,
                5:false,
                6:false,
                7:false,
                
                spacebar:false,
                click:false,
                clickAnim:false,
                mousedown:false,
                mousemove:false,
                mouseListener:function(event){
                    if(event.type == "mousemove"){
                        controller.mousemove = true;
                        controller.mouseX = event.pageX;
                        controller.mouseY = event.pageY;
                        return;
                    }else{
                        controller.mousemove = false;
                    }
                    
                    if(event.type == "mousedown"){
                        controller.mousedown = true;
                        return;
                    }else{
                        controller.mousedown = false;
                    }
                    
                    
                    
                    controller.mouseX = event.pageX;
                    controller.mouseY = event.pageY;
                    controller.click = true;
                },
                //KeyListener mostly from PothOnProgramming with some modifications
                keyListener:function(event) {
                
                    var key_state = (event.type == "keydown")?(key_state = true):false;
                    
                    
                    
                    switch(event.keyCode) {
                
                    case 37:// left key
                        controller.left = key_state;
                    break;
                    case 38:// up key
                        controller.up = key_state;
                    break;
                    case 39:// right key
                        controller.right = key_state;
                    break;
                    case 40://down key
                        controller.down = key_state;
                    break;
                    case 87://w key
                        controller.w = key_state;
                    break;
                    case 65://a key
                        controller.a = key_state;
                    break;
                    case 83://s key
                        controller.s = key_state;
                    break;
                    case 68://d key
                        controller.d = key_state;
                    break;
                    case 69://e key
                        controller.e = key_state;
                    break;
                    case 81://q key
                        controller.q = key_state;
                    break;
                    case 82://r key
                        controller.r = key_state;
                    break;
                    case 49://1 key
                        controller[1] = key_state;
                    break;
                    case 50://2 key
                        controller[2] = key_state;
                    break;
                    case 51://3 key
                        controller[3] = key_state;
                    break;
                    case 52://4 key
                        controller[4] = key_state;
                    break;
                    case 53://5 key
                        controller[5] = key_state;
                    break;
                    case 54://6 key
                        controller[6] = key_state;
                    break;
                    case 55://7 key
                        controller[7] = key_state;
                    break;
                    case 32://space bar
                        controller.spacebar = key_state;
                    break;
                    
                
                    }
                
                },
                FindButtonDialogueId:function(id){
                        this.dialogueButtonState = id;
                    },
                
                
            };
            
            const Slime = function(x,y,w,h, level = Math.floor(Math.abs(Math.random() * Math.random()) * (1 + 100 - 1) + 1)){
               this.level = level;
               this.x = x;
               this.y = y;
               this.w = w * (this.level * 0.169) + (tileSize/3); 
               this.h = h * (this.level * 0.169) + (tileSize/3);
               this.vision = (this.w * 55.5) * 0.169;
               //this.distanceFromVictim = 100000;
               this.health = this.w * (this.level * 0.169);
               this.old_x = x;
               this.old_y = y;
               this.damage = 1 * (this.level/10) + 1;
               this.x_velocity = 0;
               this.y_velocity = 0;
               this.offsetWidth = 0;
               this.offsetHeight = 0;
               this.hitBoxXSpace = 0;
               this.hitBoxYSpace = 0;
               this.hitBoxWidth = this.w;
               this.hitBoxHeight = this.h;
               this.animation = new Animation();
               this.brightness = 100;
               this.hitFlashLengthMsec = 300; //milliseconds
               this.slime_sheetFrames = [[0,1,2,3,4,5]];
               this.speed = 0.1;
               this.bottom = this.y + this.hitBoxYSpace + this.hitBoxHeight;
               this.oldBottom = this.old_y + this.hitBoxYSpace + this.hitBoxHeight;
               this.top = this.y + this.hitBoxYSpace;
               this.oldTop = this.old_y + this.hitBoxYSpace;
               this.right = this.x + this.hitBoxXSpace + this.hitBoxWidth;
               this.oldRight = this.old_x + this.hitBoxXSpace + this.hitBoxWidth;
               this.left = this.x + this.hitBoxXSpace;
               this.oldLeft = this.old_x + this.hitBoxXSpace;
               this.dropAmnt = 2;
               this.centerX = this.left + this.hitBoxWidth/2;
               this.centerY = this.top + this.hitBoxHeight/2;
            
          
             
             
               
            }
     
            Slime.prototype = {
                
                draw:function(){
               
                    
                    context.filter = "brightness(" + this.brightness + "%)";
                    context.drawImage(mob_sheet, 33*this.animation.frame, 0, 32, 32, 0 * world.tileSize - viewport.x + this.x,   0 * world.tileSize - viewport.y + this.y, this.w, this.h);
                    context.filter = "brightness(100%)";
                    
                    
                      context.fillStyle = "#db1d1a";
                   let wHp = this.health/this.hitBoxWidth;
                   wHp = (this.health) / (this.level * 0.169);
                  
               context.fillRect( (this.centerX - viewport.x) - ( (wHp) /2),  this.y - viewport.y - (this.w/10 * 2), wHp,  this.w/10 * 2);
                
                context.fillRect( (this.centerX - viewport.x) - ( (wHp) /2) - ( ((wHp * 1.2) - wHp )/2 ),  this.y - viewport.y - (this.w/10 * 2) + ((this.w/10 * 2)/4), wHp * 1.2,  (this.w/10 * 2)/2 );
                context.fillStyle = "#b01412";
                context.fillRect( (this.centerX - viewport.x) - ( (wHp) /2),  this.y - viewport.y - ((this.w/10 * 2)/2.5), wHp,  (this.w/10 * 2)/2.5 );
        
                    
                    
        
        
                },
                update:function(x,y,w,h){
                   this.old_x = this.x;
                   this.old_y = this.y;
                   
                  // this.playerLocationX = (player.left - (this.x + this.hitBoxWidth/2) ) / Math.abs( (player.left - (this.x + this.hitBoxWidth/2) ) );
                 //  this.playerLocationY = (player.top - (this.y + this.hitBoxHeight/2) )/ Math.abs( (player.top - (this.y + this.hitBoxHeight/2) ) );
                    
                 //  this.distanceFromVictim = Math.sqrt( Math.pow(this.x - (player.left + player.hitBoxWidth/2), 2) + Math.pow(this.y - (player.top + player.hitBoxHeight/2), 2) );
                   
                   this.playerLocationX = (player.centerX - this.centerX ) / Math.abs( (player.centerX - this.centerX ) );
                   this.playerLocationY = (player.centerY - this.centerY )/ Math.abs( (player.centerY - this.centerY ) );
                    
                  // this.distanceFromVictim = Math.sqrt( Math.pow(this.centerX - player.centerX, 2) + Math.pow(this.centerY - player.centerY, 2) );
                   
                   
                   if(this.distanceFromVictim() < this.vision){
                   
                   this.x_velocity+=this.speed * this.playerLocationX;
                   this.y_velocity+=this.speed * this.playerLocationY;
                   
                   this.x_velocity *= 0.9; 
                   this.y_velocity *= 0.9;
                   
                   
                  this.animation.change(this.slime_sheetFrames[0], 8);
                
                   
                   this.x += this.x_velocity;
                   this.y += this.y_velocity;
                   }
                   this.bottom = this.y + this.hitBoxYSpace + this.hitBoxHeight;
                   this.oldBottom = this.old_y + this.hitBoxYSpace + this.hitBoxHeight;
                   this.top = this.y + this.hitBoxYSpace;
                   this.oldTop = this.old_y + this.hitBoxYSpace;
                   this.right = this.x + this.hitBoxXSpace + this.hitBoxWidth;
                   this.oldRight = this.old_x + this.hitBoxXSpace + this.hitBoxWidth;
                   this.left = this.x + this.hitBoxXSpace;
                   this.oldLeft = this.old_x + this.hitBoxXSpace;
                   this.centerX = this.left + this.hitBoxWidth/2;
                   this.centerY = this.top + this.hitBoxHeight/2;
                   
                   
                
                   
                     },
                collision:function(entity){
                    
                    var startingCorner = world.map.columns * world.tileSize - viewport.x - viewport.w;
                //make these values more accurate though pretty good
                
                //Best One So Far
                var leftColumn = Math.floor(this.x / world.tileSize ); //
                var rightColumn =  Math.floor( (this.x + this.w) / world.tileSize );
                var topRow = Math.floor( (this.y) / world.tileSize ); //Doesn't look perfect because did not add dedicated hit box.
                var bottomRow = Math.floor( (this.y + this.h) / world.tileSize );
                
                
                    
                    
               if(this.x - this.old_x < 0){
                   var valueAtIndexStr = world.map.collisionLayer[bottomRow * world.map.columns +leftColumn];
                   var valueAtIndex = Number(valueAtIndexStr);
        
                    
                    if(valueAtIndex != 0){
                      
                      collision[valueAtIndex](entity,bottomRow,leftColumn);
                    }
                    
                     var valueAtIndexStr = world.map.collisionLayer[topRow * world.map.columns +leftColumn];
                   var valueAtIndex = Number(valueAtIndexStr);
                    
                    if(valueAtIndex != 0){
                      collision[valueAtIndex](entity,topRow,leftColumn);
                    }
                    
        
               
               } else if (this.x - this.old_x > 0){
                  
                    var valueAtIndexStr = world.map.collisionLayer[bottomRow * world.map.columns +rightColumn];
                   var valueAtIndex = Number(valueAtIndexStr);
        
                            
        
                    if(valueAtIndex != 0){
                      collision[valueAtIndex](entity,bottomRow,rightColumn);
                    }
                    
                     var valueAtIndexStr = world.map.collisionLayer[topRow * world.map.columns +rightColumn];
                   var valueAtIndex = Number(valueAtIndexStr);
                    
                    if(valueAtIndex != 0){
                      collision[valueAtIndex](entity,topRow,rightColumn);
                    }
                    
               }
               
               if(this.y - this.old_y < 0){
                    //Going up
                    var valueAtIndexStr = world.map.collisionLayer[topRow * world.map.columns + rightColumn];
                    var valueAtIndex = Number(valueAtIndexStr);
                            
                    if(valueAtIndex != 0){
                                   collision[valueAtIndex](entity,topRow,rightColumn);
                                }
                    
        
                    var valueAtIndexStr = world.map.collisionLayer[topRow * world.map.columns + leftColumn];
                    var valueAtIndex = Number(valueAtIndexStr);
        
                    //Top Left point
                    if(valueAtIndex != 0){
                       collision[valueAtIndex](entity,topRow,leftColumn);
                    }
        
                   
               
               
               
               
               
               
               
               } else if (this.y - this.old_y > 0){
                   //Going Down
                   
                   
                     var valueAtIndexStr = world.map.collisionLayer[bottomRow * world.map.columns + rightColumn];
                    var valueAtIndex = Number(valueAtIndexStr);
                    
                    if(valueAtIndex != 0){
                       
                       collision[valueAtIndex](entity,bottomRow,rightColumn);
                    }
        
                    var valueAtIndexStr = world.map.collisionLayer[bottomRow * world.map.columns + leftColumn];
                    var valueAtIndex = Number(valueAtIndexStr);
        
                    //Top Left point
                    if(valueAtIndex != 0){
                       collision[valueAtIndex](entity,bottomRow,leftColumn);
                    }
                   
               }
               
               
               
               if(this.x < 0){
        
                   this.x = 1;
                   this.x_velocity = 0;
               } else if (this.x + this.w> world.map.columns * world.tileSize){
                   this.x = world.map.columns * world.tileSize - this.w;
                   this.x_velocity = 0;
               }
               
               if(this.y < 0){
                   this.y = 1;
                   this.y_velocity = 0;
               } else if (this.y + this.h > world.map.rows * world.tileSize){
                   this.y = world.map.rows * world.tileSize - this.h;
                   this.y_velocity = 0;
               }
               
              
               
                                 
                                 
                
                                 },
                bulletAttackCollision:function(entity){
                    let bullet, bulletPosY, bulletPosX;
                 
                    
                    for (let indexr = bullets.length - 1; indexr > -1; -- indexr) {
        
                             bullet = bullets[indexr];
                            
                             bulletPosY = bullet.y;
                             bulletPosX = bullet.x;
                            
                            if(bulletPosX > entity.left && bulletPosX < entity.right && bulletPosY > entity.top && bulletPosY < entity.bottom){
                               bullets.splice(indexr,1);
                               entity.health -= player.bulletDamage;
                               entity.x_velocity += Math.cos(bullet.r)*player.bulletKnockback;
                               entity.y_velocity += Math.sin(bullet.r)*player.bulletKnockback;
                               
                               entity.brightness = 1000000;
                               setTimeout(()=>{
                                   entity.brightness = 100;
                               }, entity.hitFlashLengthMsec);
                               
                               //Bullet hitting skeleton
                            }
                            
                        }
                    
                
                    
                        
                },
                distanceFromVictim:function(){
                        return Math.sqrt( Math.pow(this.centerX - player.centerX , 2) + Math.pow(this.centerY - player.centerY, 2) );
        
                },
                deathCheck:function(entity, entityStack, index){
                    if(entity.health <= 0 ){
                                entityStack.splice(index, 1);
                                let yu;
                                for(yu = 0; yu < entity.dropAmnt; yu++){
                                    
                                items.push(new Item(entity.centerX  +  (Math.random() * (tileSize*1 - (-tileSize*1))) + -tileSize*1 ,entity.centerY +  (Math.random() * (tileSize*1 - (-tileSize*1))) + -tileSize*1 ,itemSize,itemSize, "gem", (13 + Math.floor(Math.random() * 6) )*33, 66)); 
                                items.push(new Item(entity.centerX  +  (Math.random() * (tileSize*1 - (-tileSize*1))) + -tileSize*1 ,entity.centerY +  (Math.random() * (tileSize*1 - (-tileSize*1))) + -tileSize*1 ,itemSize,itemSize, "slimeBall", (13 + Math.floor(Math.random() * 6) )*33, 66)); 
                                items.push(new Item(entity.centerX  +  (Math.random() * (tileSize*1 - (-tileSize*1))) + -tileSize*1 ,entity.centerY +  (Math.random() * (tileSize*1 - (-tileSize*1))) + -tileSize*1 ,itemSize,itemSize, "gem", (13 + Math.floor(Math.random() * 6) )*33, 66)); 
                                items.push(new Item(entity.centerX  +  (Math.random() * (tileSize*1 - (-tileSize*1))) + -tileSize*1 ,entity.centerY +  (Math.random() * (tileSize*1 - (-tileSize*1))) + -tileSize*1 ,itemSize,itemSize, "gem", (13 + Math.floor(Math.random() * 6) )*33, 66)); 
                                
                                }
                                
                            }
                },
         
            };
    
            collision = {
                1:function(object,row,column){
                   
                    this.bottomCollision(object,row);
                },  //Only bottom side collision
                2:function(object,row,column){
           
                     this.rightCollision(object, column);
               
        
                },  //Only right side collision
                3:function(object,row,column){
                    this.leftCollision(object, column);
                },  //Only left side collision
                4:function(object,row,column){
                    this.topCollision(object, row);
                },  //Only top side collision
                5:function(object,row,column){
                
                    if (this.topCollision(object, row)) { return; }// Make sure to early out
                    if (this.leftCollision(object, column)) { return; }// if a collision is detected.
                    if (this.rightCollision(object, column)) { return; }
                    this.bottomCollision(object, row);// No need to early out on the last check.
           
                },  //All sides collision
                6:function(object,row,column){
                    //Add animation for this
                    if(object == player){
                    let tileCoords = row * world.map.columns + column;
                    
                    items = [];
                    //slimes = [];
                    
                    //Prevent this from triggering twice or mulitple times
                    world.map.collisionLayer[tileCoords] = "000";
                    
                    let e = 100;
                    let speed = 5;
                    const playerCoordX = player.left;
                    const playerCoordY = player.top;                    
            
                    let bana = setInterval( ()=>{
                        e-=speed;
                        
                        player.y_velocity = 0;
                        
                        if(e > 0 && speed >= 1){
                            player.y = playerCoordY;
                        }
                        
                        if(e <= 0){
                            
                            level++;
                            world.map.collisionLayer[tileCoords] = "006";
                            player.x = world[level].respawnCoords.x;
                            player.y = world[level].respawnCoords.y;
             
                            changeWorld(world[level]);
                            
                          
                            speed*=-1;
                            
                        }
                        if(speed < 1 && e >= 100){
                            
                            
                            clearInterval(bana);
                            e = 100;
                            return;
                            
                        }
                        
                        document.querySelector('canvas').style.filter = "brightness(" + e + "%)";
            
                        
                    }, 50);
                  
                    }
                       
                },  //To the next level collision
                7:function(object,row,column){
                    //Add animation for this
                    let tileCoords = row * world.map.columns + column;
                    let whichWidth;
                    let whichHeight;
                    let originalWidth;
                    let originalHeight;
                    let distFromSpawn;
                    let counter = 10; //100 30 ms cycles
                         
                    //world.map.collisionLayer[tileCoords] = "000";
                    if(object == player && player.deathState){
                        return;
                    }
                    
                    
                    if(object == player){
                        //object.width -= (object.width/30);
                        //object.height -= (object.height/30);
                        whichWidth = "width";
                        whichHeight = "height";
                        player.deathState = true;
                        originalWidth = object.width;
                        originalHeight = object.height;
                    }else{
                        //object.w -= (object.w/10);
                        //object.h -= (object.h/10);
                        whichWidth = "w";
                        whichHeight = "h";
                         originalWidth = object.w;
                         originalHeight = object.h;
                    }
                    
                    let slowFall = setInterval( ()=>{
                        object[whichWidth] -= (object[whichWidth]/3);
                        object[whichHeight] -= (object[whichHeight]/3);
                       
                        object.x_velocity = 0;
                        object.y_velocity = 0; 
                        counter--;
            
                        if(counter <= 0){
                            clearInterval(slowFall);
                            object.x = world.map.respawnCoords.x;
                            object.y = world.map.respawnCoords.y;
                            object.deathState = false;
                            
                            
                            
                            object[whichWidth] = originalWidth;
                            object[whichHeight] = originalHeight;
                            
                        }
                        
                    }, 30);
                    
                    
           
                },  //Spikes Death collision
                8:function(object,row,column){
                //Add animation for this
                if(object == player){
                let tileCoords = row * world.map.columns + column;
                
                items = [];
                //player.speed = player.defaultSpeed;
                //slimes = [];
                
                world.map.collisionLayer[tileCoords] = "000";
                
                let e = 100;
                let speed = 5;
                const playerCoordX = player.left;
                const playerCoordY = player.top;
                const targetDoorTileCoords = world.map.doors[tileCoords].targetDoorTileCoords;
                
        
                let bana = setInterval( ()=>{
                    e-=speed;
                    
                    player.y_velocity = 0;
                    
                    if(e > 0 && speed >= 1){
                        player.y = playerCoordY;
                    }
                    
                    
                    if(e <= 0){
                        
                        world.map.collisionLayer[tileCoords] = "006";
                        player.x = world.map.doors[tileCoords].playerCoords.x;
                        player.y = world.map.doors[tileCoords].playerCoords.y;
                        
                        world.map = world.map.doors[tileCoords].world;
                        world.map.collisionLayer[targetDoorTileCoords] = "001";
                        
                        changeWorld(world.map);
                        
                      
                        speed*=-1;
                        
                    }
                    if(speed < 1 && e >= 100){
                        
                        
                        clearInterval(bana);
                        world.map.collisionLayer[targetDoorTileCoords] = "006"
                        e = 100;
                        return;
                        
                    }
                    
                    document.querySelector('canvas').style.filter = "brightness(" + e + "%)";
        
                    
                }, 50);
              
                }
                   
                },  //Door to other room collision (checkpoint tile)
                9:function(object,row,column, tileRedirect = false){
                //Add animation for this
                if(object == player){
                    
                let tileCoords = row * world.map.columns + column;
                
                if(tileRedirect){
                context.drawImage(item_sheet, 0, 151, 32, 32, (column * world.tileSize) - viewport.x, ( (row - 1) * world.tileSize) - viewport.y, world.tileSize,world.tileSize);
                }
                
                if(controller.q){
                  
                    let yur;
                    for(yur = 0; yur < world.map.chests[tileCoords].length; yur++){
                        world.map.chests[tileCoords][yur].x = (column * world.tileSize) + (Math.random() * (world.tileSize - world.map.chests[tileCoords][yur].w));
                        world.map.chests[tileCoords][yur].y = (row * world.tileSize) + (Math.random() * (world.tileSize - world.map.chests[tileCoords][yur].h)) + world.tileSize;
                        
                        items.push(world.map.chests[tileCoords][yur]);
                        
                    }
                    world.map.collisionLayer[tileCoords] = "005";
                    world.map.subLayer[tileCoords] = "153";
                    
                    controller.q = false;
                }
        
                
                    
                }
                
                if(!tileRedirect){
                    if (this.topCollision(object, row)) { return; }// Make sure to early out
                    if (this.leftCollision(object, column)) { return; }// if a collision is detected.
                    if (this.rightCollision(object, column)) { return; }
                    this.bottomCollision(object, row);// No need to early out on the last check.
                }
                
                
                
                }, //Chest collision?
                11:function(object,row,column){
                    if(object == player){
                        
                        let tileCoords = row * world.map.columns + column;
                        let redirectTile = world.map.redirectTiles[tileCoords];
                        if(world.map.collisionLayer[redirectTile.redirectCoords.row * world.map.columns + redirectTile.redirectCoords.column] == redirectTile.redirectCollisionNum){
                            //TileRedirectFunction
                            collision[redirectTile.redirectCollisionNum](player, redirectTile.redirectCoords.row, redirectTile.redirectCoords.column, true);
                        
                        }
                        
                    }
                }, //Redirect tile
                12:function(object, row, column){
                    object.speed*=2;
                }, //speed up tile
                13:function(object, row, column){
                    let bounciness = 20;
                    if(this.topCollision(object, row)){
                        viewport.yv += bounciness * 2;
                        viewport.yv *= -1;
                        return;
                    }
                    if(this.leftCollision(object, column)){
                        viewport.xv += bounciness * 2;
                        viewport.xv *= -1;
                        return;
                      }

                    if(this.rightCollision(object, column)){
                        viewport.xv -= bounciness * 2;
                        viewport.xv *= -1;
                        return;
                    }

                    if(this.bottomCollision(object, row)){
                        viewport.yv -= bounciness * 2;
                        viewport.yv *= -1;
                        return;
                    }
                           
                }, // bouncy tile
                14:function(object,row,column){
                    if(object == player){
                    let tileCoords = row * world.map.columns + column;
                    //Gets the layer through string then target id to change
                    let xz;
                    for(xz = 0; xz < world.map.tileModders[tileCoords].length; xz++){
                        world.map[world.map.tileModders[tileCoords][xz].layer][world.map.tileModders[tileCoords][xz].targetTileId] = world.map.tileModders[tileCoords][xz].tileData;
                        world.map.collisionLayer[world.map.tileModders[tileCoords][xz].targetTileId] = world.map.tileModders[tileCoords][xz].collisionData;
                        
                    }
                    }
                }, //Tile modder collision
                15:function(object, row, column){

                }, //half slab spikes
                16:function(object, row, column){
                     //Add animation for this
                     if(object == player){
                        let tileCoords = row * world.map.columns + column;
                        
                        items = [];
                        //slimes = [];
                        
                        //Prevent this from triggering twice or mulitple times
                        world.map.collisionLayer[tileCoords] = "000";
                        
                        let e = 100;
                        let speed = 5;
                        const playerCoordX = player.left;
                        const playerCoordY = player.top;                    
                
                        let bana = setInterval( ()=>{
                            e-=speed;
                            
                            player.y_velocity = 0;
                            
                            if(e > 0 && speed >= 1){
                                player.y = playerCoordY;
                            }
                            
                            if(e <= 0){
                                
                                level++;
                                world.map.collisionLayer[tileCoords] = "006";
                                player.x = world[level].respawnCoords.x;
                                player.y = world[level].respawnCoords.y;
                 
                                changeWorld(world[1]);
                                
                              
                                speed*=-1;
                                
                            }
                            if(speed < 1 && e >= 100){
                                
                                
                                clearInterval(bana);
                                e = 100;
                                return;
                                
                            }
                            
                            document.querySelector('canvas').style.filter = "brightness(" + e + "%)";
                
                            
                        }, 50);
                      
                        }
                           
                }, //Game finish checkpoint
                bottomCollision:function(object, row, offset = 0){
                   
                    if(object.top - object.oldTop < 0){
                        var bottom = (row+1) * world.tileSize; //288
                       
                       //292.54716981132077 distance between player top and viewport.x
                       
                    if(object.top < bottom - offset && object.oldTop >= bottom - offset){
                  
                         object.y_velocity = 0;
                        
                       //object.old_y = object.y = bottom - object.cameraOffsetHeight - (object.hitBoxYSpace - 1);
                   
                        object.old_y = object.y = bottom - object.offsetHeight - offset;
                       
                      
                          return true;
                   }
                   
                } 
                return false;
                },
                topCollision:function(object, row, offset = 0){
                //console.log(":O " + object.bottom + " " + object.oldBottom);
                
                    if(object.bottom - object.oldBottom > 0){
                        var top = row * world.tileSize;
            
                        if(object.bottom > top + offset && object.oldBottom <= top + offset){
                            
                            object.y_velocity = 0;
                            object.old_y = object.y = top - object.hitBoxHeight - object.offsetHeight + offset - 0.01;                            
                                                
                            //viewport.oy = viewport.y = top - (viewport.h * 0.5) - ((player.height/5.3) * 4);
                                
                            for(let x = 0; x < object.canJump.length; x++){
                                object.canJump[x] = true;
                            }

                            //console.log(object);
                            
                            return true;  
                        }
                        // viewport.oy = viewport.y = top - (viewport.h * 0.5) - player.height/5.3 - player.hitBoxHeight;
                    } 
                    return false;
                },
                leftCollision:function(object, column, offset = 0){
                
                if (object.right - object.oldRight > 0) {
                    
                    // the left side of the specified tile column
                    var left = column * world.tileSize;
                          
        
                    if (object.right > left + offset && object.oldRight <= left + offset){
                        //console.log(top + " top");
                        //console.log(viewport.getPlayerY() + " viewport player y");
                        object.x_velocity = 0;
                        object.old_x = object.x = left - (object.hitBoxWidth + object.offsetWidth) + offset - 0.01;
                        
                        return true;
                    }
                
                }
                return false;
              
              
                },
                rightCollision:function(object, column, offset = 0){
                if (object.left - object.oldLeft < 0) {
                   
                  // the left side of the specified tile column
                  var right = (column + 1) * world.tileSize; //576
                
                       
        
                if(object.left < right - offset && object.oldLeft >= right - offset){
                
                
                
                object.x_velocity = 0;
                object.old_x = object.x = right - object.offsetWidth - offset;    
                  
                return true;
                }
                }    
                return false;
                }
               
            };
            
            //START UP STUFF Start
            //startUpWorld();
            //End
            // prevent antialiasing 
        
            render = function(){
                        //Color in background
                    gameCycles++;
                    context.fillStyle = backgroundColor;
                    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
                    
                    x_min = Math.floor(viewport.x / world.tileSize);
                    y_min = Math.floor(viewport.y / world.tileSize);
                    x_max = Math.ceil((viewport.x + viewport.w) / world.tileSize);
                    y_max = Math.ceil((viewport.y + viewport.h) / world.tileSize);
                        
                    if(x_min < 0){x_min = 0;}
                    if(y_min < 0){y_min = 0;}
                    if(x_max > world.map.columns){x_max = world.map.columns;}
                    if(y_max > world.map.rows){y_max = world.map.rows;}
                    //simple border for camera
                    // if(viewport.x < 0){viewport.x = 0;}
                    // if(viewport.y < 0){viewport.y = 0;}
                    // if(viewport.x + viewport.w  > world.map.columns * world.tileSize){viewport.x = world.map.columns * world.tileSize - viewport.w}
                    // if(viewport.y + viewport.h  > world.map.rows * world.tileSize){viewport.y = world.map.rows * world.tileSize - viewport.h}
                    
                    //~1020
                    
                    let index;
                    
                        //Color in world
                    for(var x = x_min; x < x_max; x++){

                    // context.drawImage(tile_sheet, 30, 70,300,300);
                    //Tile Background Below
                    for(var y = y_min; y < y_max; y++){
                
                        
                        var value = world.map.layout[y * world.map.columns + x];
                        //This is because my tileset is 10 tiles wide and ~6 tall so I need to do this to go down a level 
                        if(value == undefined){
                            console.log(value +" " + y + " " + x);
                        }
                        //var strValue = value.toString();
                        var strSplit = value.split("");
                        //console.log(strSplit);
                        
                        //+ width * 0.5 - viewport.w * 0.5
                        //+ height * 0.5 - viewport.h * 0.5
                        var tile_x = Math.floor(x * world.tileSize - viewport.x );
                        var tile_y = Math.floor(y * world.tileSize - viewport.y );
                            
                        // value with 
                        //can use .length to switch y cuts especially if I make it ten wide? Can also make 20 wide then divide by 2
                        // Change: March 19, 4:38 : Changed this: context.drawImage(tile_sheet, 33 * Number([1]), 33 * Number(strSplit[0]), 32, 32, tile_x, tile_y, world.tileSize, world.tileSize);
                        
                        //context.drawImage(tile_sheet, 33 * Number(strSplit[strSplit.length - 1]), 33 * Number(strSplit[0] + strSplit[1]), 32, 32, tile_x, tile_y, world.tileSize, world.tileSize);
                        //context.fillRect(0,0,500,500);                        
                        if(world.map.subLayer[y * world.map.columns + x] != undefined && world.map.subLayer[y * world.map.columns + x] != "***"){
                        
                            let valueSub = world.map.subLayer[y * world.map.columns + x];
                            let strSplitSub = valueSub.split("");
                        
                            // console.log(valueSub);
                            // console.log(strSplitSub);
                        
                            //Math.floor(135/100);
                        
                            //context.drawImage(tile_sheet, 33 * Number(strSplitSub[strSplitSub.length - 1]), 33 * Number(strSplitSub[0] + strSplitSub[1]), 32, 32, tile_x, tile_y, world.tileSize, world.tileSize);      
                        }  
                        //change the 2nd parameter to change img block
                        //console.log(strSplitSub[strSplitSub.length - 1]);
                        context.drawImage(tile_sheet,
                            Number(value)*32-32,
                            0,
                            30,
                            32,
                            tile_x,
                            tile_y,
                            world.tileSize,
                            world.tileSize);

                    }  
                    

                    }    
                    
                    for ( index = bullets.length - 1; index > -1; -- index) {
                
                                    let bullet = bullets[index];
                                    
                                    if(bullet.collision(index, bullets)){
                                        continue;
                                    }
                         
                                    context.save();
                                    
                                    //bullet.x - viewport.x, bullet.y - viewport.y
                                    context.fillStyle = "#FFFFFF";
                                    context.translate(bullet.x - viewport.x, bullet.y - viewport.y);
                                    context.rotate(bullet.r);
                                    
                                    context.fillRect(bulletSize/-2, bulletSize/-2, bulletSize, bulletSize);
                                    context.restore();
                                    
                                
                                    bullet.updatePosition();
              
                                }
                                
                    for ( index = mobBullets.length - 1; index > -1; -- index) {
                
                        
                                    let bullet = mobBullets[index];
                                    
                                    if(bullet.collision(index, mobBullets)){
                                        continue;
                                    }
                
                                    bullet.updatePosition();
                
                                    context.fillStyle = "#FFFFFF";
                                        
                                    context.save();
                                    
                                    context.translate(bullet.x - viewport.x, bullet.y - viewport.y);
                                    context.rotate(bullet.r);
                                
                                    context.drawImage(player_sheet, 33*15, 0, 32, 32, 64 / -2, 64 / -2, bulletSize, bulletSize);
                                    context.restore();
                                    
                                
                                    
                                    if(bullet.x  > player.left && bullet.x  < player.right && bullet.y > player.top && bullet.y  < player.bottom){
                                        player.health -= bullet.dmg;
                                        mobBullets.splice(index, 1);
                                    }
                                    
                                    
                                }
      
                    for ( index = Object.keys(world.map.mobs.slimes).length - 1; index > -1; -- index) {
                
                                    let slimer = world.map.mobs.slimes[index].entity;
                                    if(slimer.distanceFromVictim() + slimer.w/2 < vmax){
                                        
                                        slimer.draw();
                                        slimer.update();
                                        slimer.collision(slimer);
                                        slimer.animation.update();
                                        
                                        if(player.right > slimer.x && player.right < slimer.x + slimer.w && player.top > slimer.y && player.top < slimer.y + slimer.h){
                                            //bullets.splice(indexr,1);
                                            player.health -= slimer.damage;
                                            
                                            //Could make sword attack false to make it one hit damage type
                                            
                                        }
                                        
                                        slimer.bulletAttackCollision(slimer);
                                        slimer.deathCheck(slimer, world.map.mobs.slimes, index);
                                    }
                                    
                    
                                    
                                    
                                
                                
                                }
                    
                    for( index = items.length - 1; index > -1; -- index){
                        let item = items[index];
                        if(item.distanceFromVictim() + item.w/2 < vmax){
                            item.draw();
                            
                            item.collision(player, index);
                            item.update();
                            
                    
                            player.inventory.pickUpItem(item, index); //There is a if statement built into it 
                        //  player.inventory.use(item);
                                    
                            item.update();
                        }
                        
                    }
                    
                    context.fillStyle = "#FFFFFF";   
                    context.beginPath();
                    
                    player1.prototype.draw();
                        
                    //Layers Loop below
                    for(var x = x_min; x < x_max; x++){
                        for(var y = y_min; y < y_max; y++){
                        
                        var value1 = world.map.layer[y * world.map.columns + x];
                        
                        var strSplit1 = value1.split("");
                        //+ width * 0.5 - viewport.w * 0.5
                    // + height * 0.5 - viewport.h * 0.5
                        var tile_x = Math.floor(x * world.tileSize - viewport.x );
                        var tile_y = Math.floor(y * world.tileSize - viewport.y );
                
                        // value with 
                        //can use .length to switch y cuts especially if I make it ten wide? Can also make 20 wide then divide by 2
                        
                        switch(value1){
                            case "001":
                                context.fillStyle = "#000000";
                            break;
                            case "002":
                                context.fillStyle = "#318734";
                            break;
                            case "003":
                                context.fillStyle = "#318734";
                            break;
                            case "004":
                                context.fillStyle = "#318734";
                            break;
                            default:
                                context.fillStyle = "#318734";
                            break;

                        }
                        if(value1 !== "***"){
                            context.fillRect(tile_x, tile_y, world.tileSize, world.tileSize);
                        }
                        //context.drawImage(tile_sheet, 33 * Number(strSplit1[strSplit1.length - 1]), 33 * Number(strSplit1[0] + strSplit1[1]), 32, 32, tile_x, tile_y, world.tileSize, world.tileSize);
                        
                       
                        
                        //change the 2nd parameter to change img block
                    }
                    }
                    
                    player.inventory.draw();
                
                    context.fill();
                    
            }
         
            loop = function(){   
                    window.requestAnimationFrame(loop);
                                        
                    height = document.documentElement.clientHeight;
                    width = document.documentElement.clientWidth;
                    vmax = Math.max(height, width);
                    
                    if(context.canvas.height != height || context.canvas.width != width){
                        // const track = player.left;
                        player.x = player.left + ((context.canvas.width - width)/2);
                        player.y = player.top + ((context.canvas.height - height)/2);
                            
                    }
                    
                    context.canvas.height = height;
                    context.canvas.width  = width;
                    
                    context.imageSmoothingEnabled = false;
                            
                    player.animation.update();
                            
                    if(bullets.length > 1000){
                                bullets = [];
                    }
                    if(mobBullets.length > 100){
                                mobBullets = [];
                    }
                            
                    render();
                                
                    player1.prototype.interact();
                    player1.prototype.update(); //UPDATE HAS TO GO AFTER INTERACT AHHHHH 
                    player1.prototype.collision(); //this has to go last

            }
                
               
               
               
                var tile_sheet = new Image();
                tile_sheet.addEventListener("load", (event) => { loadedState = true; });
                tile_sheet.src = "https://github.com/Cooper-Taylor/main/blob/main/Extras/Platformer/assets/tileSheet.png?raw=true";
                //"https://user-images.githubusercontent.com/57375954/78173239-64160c80-7425-11ea-8482-c71c8ca1e3d4.png"; // Medium Quality Version
               
               
               
                //"https://user-images.githubusercontent.com/57375954/74661861-c7dec180-5166-11ea-8872-e0818b452a02.png"; Kinda Old
                
                //https://user-images.githubusercontent.com/57375954/74612482-cc0dcf00-50d3-11ea-8df5-c54ed2e3df43.png"; OLD
                
                //https://user-images.githubusercontent.com/57375954/73142255-c2f08b80-405a-11ea-9fbd-d6179e419fff.png"; OLDESt
                
               var mob_sheet = new Image();
               
               mob_sheet.src = "https://user-images.githubusercontent.com/57375954/76334433-6e7f3380-62c9-11ea-9354-8df0b09bd52f.png";
                
                //https://user-images.githubusercontent.com/57375954/72667219-7f0cdf00-39e7-11ea-8c5d-afcab67e7e4a.png";
            
               var  mobs_sheet = new Image();
                mobs_sheet.src = "https://user-images.githubusercontent.com/57375954/78508964-aeb2c400-7758-11ea-8378-7349809a66de.png";
                
                var item_sheet = new Image();
                item_sheet.src = "https://user-images.githubusercontent.com/57375954/87887115-47134280-c9f0-11ea-845c-85e6ff9ffc98.png";
                
                window.addEventListener("keydown", controller.keyListener );
                window.addEventListener("keyup", controller.keyListener );
                window.addEventListener("click", controller.mouseListener);
                window.addEventListener("mousedown", controller.mouseListener);
                window.addEventListener("mousemove", controller.mouseListener);
                
                 
                
                