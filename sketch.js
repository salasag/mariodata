//import { ColorCycler } from "./ColorCycler";

var CANVAS_HEIGHT = 800;
var CANVAS_WIDTH  = 1600;
let FPS = 60;
let objects = [];
let clouds  = [];
let goombas = [];
let isMousePreviouslyPressed = false;
let STOCK_DATA;
let MARIO_STANDING_1_IMAGE;
let MARIO_STANDING_2_IMAGE;
let MARIO_JUMPING_IMAGE;
let MARIO_STANDING_1_INVERTED_IMAGE;
let MARIO_STANDING_2_INVERTED_IMAGE;
let MARIO_JUMPING_INVERTED_IMAGE;
let counter = 0;
let MARIO_OBJECT;
let CSV_INDEX = 0;
let TRANSLATION=0;
let SCENE_MANAGER;
let CSV_STEP = 10;
let points = 100;
let MAX_VALUE = 0;
let FONT;
let newGoomba = false;

function setup(){
    CANVAS_HEIGHT = windowHeight-1;
    CANVAS_WIDTH  = windowWidth-150;
    cnv = createCanvas(CANVAS_WIDTH,CANVAS_HEIGHT);
    // SCENE_MANAGER = new SCENE_MANAGER();
    // SCENE_MANAGER.addScene( Animation1 )
    // SCENE_MANAGER.showNextScene();
    frameRate(FPS);
    textAlign(CENTER, CENTER);
    textSize(30)
    textFont(FONT)
    background(120,124,249);
    setupObjects();
    cursor(CROSS)
    fill(0);
    console.log(STOCK_DATA)
}

// function Animation1(){

//     this.enter = function(){
//         // frameCount is a thing
//     }

//     this.draw = function(){

//     }

//     this.mousePressed = function(){
//         this.sceneManager.showNextScene()
//     }
// }

function preload(){
    STOCK_DATA = loadTable("data/NTDOY.csv","header")
    MARIO_STANDING_1_IMAGE = loadImage("images/mario_standing1.png")
    MARIO_STANDING_2_IMAGE = loadImage("images/mario_standing2.png")
    MARIO_JUMPING_IMAGE = loadImage("images/mario_jumping.png")
    MARIO_STANDING_1_INVERTED_IMAGE = loadImage("images/mario_standing1_inverted.png")
    MARIO_STANDING_2_INVERTED_IMAGE = loadImage("images/mario_standing2_inverted.png")
    MARIO_JUMPING_INVERTED_IMAGE = loadImage("images/mario_jumping_inverted.png")
    GOOMBA_1_IMAGE = loadImage("images/goomba1.png")
    GOOMBA_2_IMAGE = loadImage("images/goomba2.png")
    GOOMBA_DEAD_IMAGE = loadImage("images/goomba_dead.png")
    BRICK_IMAGE = loadImage("images/brick.png")
    PIPE_IMAGE = loadImage("images/pipe.png")
    CLOUD_SMALL_IMAGE = loadImage("images/cloud_small.png")
    CLOUD_LARGE_IMAGE = loadImage("images/cloud_large.png")
    SUN_IMAGE = loadImage("images/sun.png")
    LOGO_IMAGE = loadImage("images/nintendo_logo.png")
    FONT = loadFont("fonts/emulogic.ttf")
}

function keyPressed() {
    if (keyCode === UP_ARROW && Math.abs(MARIO_OBJECT.yVelocity) < 2 && !MARIO_OBJECT.isJumping) {
        MARIO_OBJECT.jump()
    }
    if(keyCode == 32 && Math.abs(MARIO_OBJECT.yVelocity) < 2 && !MARIO_OBJECT.isJumping){ // SPACEBAR
        MARIO_OBJECT.invertGravity()
    }
    if(keyCode == 82){ // R-Key
        restart()
    }
}

function restart(){
    objects = []
    clouds  = []
    goombas = []
    counter = 0;
    CSV_INDEX = 0;
    TRANSLATION=0;
    points = 100;
    newGoomba = false;
    setupObjects();
}

function setupObjects(){
    MARIO_OBJECT = new MarioObject(50,50,50,50);
}

function draw(){
    background(120,124,249);
    generateObjects();
    drawObjects();
    handleCollisions();
    handleInput();
    handleCounter();
    isMousePreviouslyPressed = mouseIsPressed;
}

/**
 * This handles object generation such as the clouds and the platforms
 */
function generateObjects(){
    if(counter%(600*5*1/60)==0){
        let size = 50
        let height = (CANVAS_HEIGHT-size)/2;
        if(Math.abs(TRANSLATION)>4){
            console.log("Zero?",TRANSLATION)
        }
        if(CSV_INDEX != 0){
            let percentIncrease = (STOCK_DATA.rows[CSV_INDEX].obj.Open/STOCK_DATA.rows[Math.max(CSV_INDEX-CSV_STEP,0)].obj.Open)-1
            let addedTranslation = Math.min((percentIncrease)*800,320);
            TRANSLATION += addedTranslation
            points *= Math.sign(MARIO_OBJECT.yAcceleration)==1?1+percentIncrease:1/(1+percentIncrease)
        }
        else{
            MARIO_OBJECT.xPosition = CANVAS_WIDTH
            MARIO_OBJECT.yPosition = CANVAS_HEIGHT-size-height-MARIO_OBJECT.height
        }
        objects.push(new PlatformObject(CANVAS_WIDTH,CANVAS_HEIGHT-size-height,-5,0,size,size,3,Math.random()<.2))
        newGoomba = false
        if(Math.random()<.2 && objects.length!=1){
            goombas.push(new Goomba(CANVAS_WIDTH,CANVAS_HEIGHT-2*size-height,3,0,size,size,size*3,-5))
            newGoomba = true
        }
        incrementCSVIndex();
    }
    let translationIncrement = Math.max(.1*Math.abs(TRANSLATION),4)
    if(TRANSLATION < -translationIncrement){
        translationIncrement *= -1;
    }
    else if(Math.abs(TRANSLATION) < translationIncrement){
        translationIncrement = 0;
    }
    for(let i = 0; i < objects.length-1; i++){
        objects[i].yPosition+=translationIncrement;
    }
    for(let i = 0; i < goombas.length; i++){
        if(!(i == goombas.length-1 && newGoomba)){
            goombas[i].yPosition+=translationIncrement;
        }
    }
    MARIO_OBJECT.yPosition+=translationIncrement;
    TRANSLATION-=translationIncrement;
    if(counter%(60*2*1/60)==0){
        let rand = Math.random()
        let threshold = .03
        if(rand < threshold){
            clouds.push(new CloudObject(CANVAS_WIDTH,Math.random()*CANVAS_HEIGHT/2,-4,0,50,50,rand<threshold/2))
        }
    }
}

/**
 * This draws objects on the screen and updates movement
 */
function drawObjects(){
    image(SUN_IMAGE,CANVAS_WIDTH*3/4,CANVAS_HEIGHT/10,SUN_IMAGE.width,SUN_IMAGE.height);
    clouds.map((currentObject)=>{
        currentObject.move();
        currentObject.draw();
    })
    if(clouds[0] && clouds[0].xPosition==0){
        clouds.splice(0,1)
    }
    image(LOGO_IMAGE,0,0,LOGO_IMAGE.width/2,LOGO_IMAGE.height/2);
    fill(200);
    text("Date: "+STOCK_DATA.rows[CSV_INDEX].obj.Date, CANVAS_WIDTH/2, CANVAS_HEIGHT*3/4);
    fill(200);
    text("Price: $"+parseFloat(STOCK_DATA.rows[CSV_INDEX].obj.Open).toFixed(4), CANVAS_WIDTH/2, CANVAS_HEIGHT*3/4+50);
    fill(200);
    text("Money: $"+points.toFixed(2), CANVAS_WIDTH/2, CANVAS_HEIGHT*3/4+100);
    objects.map(currentObject => {
        currentObject.move();
        currentObject.draw();
    });
    goombas.map(currentObject => {
        currentObject.move();
        currentObject.draw();
    });
    if(objects[0].xPosition<0-50*3){
        objects.splice(0,1)
    }
    if(goombas.length!=0 && goombas[0].xPosition<0-50){
        goombas.splice(0,1)
    }
    MARIO_OBJECT.draw()
    MARIO_OBJECT.update()
}

/**
 * This ensures that Mario can't fall through the screen
 * Additionally handles Goomba hits
 */
function handleCollisions(){
    let toDestroy = []
    objects.map((obj1,index) => {
        if(isCollisionRectangle(MARIO_OBJECT.xPosition, MARIO_OBJECT.width, MARIO_OBJECT.yPosition, MARIO_OBJECT.height,
                                obj1.xPosition,         obj1.width,         obj1.yPosition,         obj1.height)){
            switch(Math.min(MARIO_OBJECT.xPosition+MARIO_OBJECT.width -obj1.xPosition,obj1.xPosition+obj1.width -MARIO_OBJECT.xPosition,
                            MARIO_OBJECT.yPosition+MARIO_OBJECT.height-obj1.yPosition,obj1.yPosition+obj1.height-MARIO_OBJECT.yPosition)){
                case MARIO_OBJECT.xPosition+MARIO_OBJECT.width-obj1.xPosition:{
                    MARIO_OBJECT.xPosition=obj1.xPosition-MARIO_OBJECT.width;
                    break;
                }
                case obj1.xPosition+obj1.width -MARIO_OBJECT.xPosition:{
                    MARIO_OBJECT.xPosition=obj1.xPosition+obj1.width;
                    break;
                }
                case MARIO_OBJECT.yPosition+MARIO_OBJECT.height-obj1.yPosition:{ // TOP Hit
                    MARIO_OBJECT.yPosition=obj1.yPosition-MARIO_OBJECT.height;
                    if(MARIO_OBJECT.yAcceleration>0){
                        MARIO_OBJECT.yVelocity=0
                        MARIO_OBJECT.isJumping=false;
                    }
                    break;
                }
                case obj1.yPosition+obj1.height-MARIO_OBJECT.yPosition:{
                    MARIO_OBJECT.yPosition=obj1.yPosition+obj1.height;
                    if(MARIO_OBJECT.yAcceleration<0){
                        MARIO_OBJECT.yVelocity=0
                        MARIO_OBJECT.isJumping=false;
                    }
                    break;
                }
                default:{

                }
            }
        }
    });
    goombas.map((obj1,index) => {
        if(isCollisionRectangle(MARIO_OBJECT.xPosition, MARIO_OBJECT.width, MARIO_OBJECT.yPosition, MARIO_OBJECT.height,
                                obj1.xPosition,         obj1.width,         obj1.yPosition,         obj1.height) && MARIO_OBJECT.yAcceleration > 0){
            switch(Math.min(MARIO_OBJECT.xPosition+MARIO_OBJECT.width -obj1.xPosition,obj1.xPosition+obj1.width -MARIO_OBJECT.xPosition,
                            MARIO_OBJECT.yPosition+MARIO_OBJECT.height-obj1.yPosition,obj1.yPosition+obj1.height-MARIO_OBJECT.yPosition)){
                case MARIO_OBJECT.xPosition+MARIO_OBJECT.width-obj1.xPosition:{
                    MARIO_OBJECT.xPosition=obj1.xPosition-MARIO_OBJECT.width;
                    MARIO_OBJECT.hurt("left")
                    break;
                }
                case obj1.xPosition+obj1.width -MARIO_OBJECT.xPosition:{
                    MARIO_OBJECT.xPosition=obj1.xPosition+obj1.width;
                    MARIO_OBJECT.hurt("right")
                    break;
                }
                case MARIO_OBJECT.yPosition+MARIO_OBJECT.height-obj1.yPosition:{
                    MARIO_OBJECT.yPosition=obj1.yPosition-MARIO_OBJECT.height;
                    MARIO_OBJECT.yVelocity=0
                    MARIO_OBJECT.jump();
                    obj1.kill()
                    points *= 1.03
                    break;
                }
                case obj1.yPosition+obj1.height-MARIO_OBJECT.yPosition:{
                    MARIO_OBJECT.yPosition=obj1.yPosition+obj1.height;
                    MARIO_OBJECT.yVelocity=0
                    MARIO_OBJECT.jump();
                    obj1.kill()
                    points *= 1.03
                    break;
                }
                default:{

                }
            }
        }
    });
}

/**
 * This is a global counter that I use to represent time
 * I think this already has an equivalent in p5js but oh well
 */
function handleCounter(){
    counter++;
    if(counter > 1000000000){
        counter=0;
    }
}

/**
 * This handles the movement for Mario (except for jumping)
 */
function handleInput(){
    if (keyIsDown(LEFT_ARROW)) {
        MARIO_OBJECT.move(-1)
    } else if (keyIsDown(RIGHT_ARROW)) {
        MARIO_OBJECT.move(1)
    } else {
        MARIO_OBJECT.move(0)
    }
}

/**
 * This increments the CSV index by a step so the correct platform is generated
 */
function incrementCSVIndex(){
    CSV_INDEX = (CSV_INDEX+CSV_STEP)%(STOCK_DATA.rows.length)
}

/**
 * Checks if rectangles have collided
 * @param {x Position of the first rectangle} x1 
 * @param {width of the first rectangle} width1 
 * @param {y Position of the first rectangle} y1 
 * @param {height of the first rectangle} height1 
 * @param {x Position of the second rectangle} x2 
 * @param {width of the second rectangle} width2 
 * @param {y Position of the second rectangle} y2 
 * @param {height of the second rectangle} height2 
 */
function isCollisionRectangle(x1,width1,y1,height1,x2,width2,y2,height2){
    return x1 < (x2+width2) && (x1+width1) > x2 &&
           y1 < (y2+height2) && (y1+height1) > y2;
}

/**
 * Checks if circles have collided
 * @param {width  of the first circle} width1 
 * @param {height of the first circle} height1
 * @param {radius of the first circle} y1  
 * @param {width  of the second circle} width2 
 * @param {height of the second circle} height2
 * @param {radius of the second circle} y2  
 */
function isCollisionCircle(x1,y1,r1,x2,y2,r2){
    return distance(x1,y1,x2,y2) < r1+r2;
}

/**
 * Returns the distance between two points
 * @param {x Position of the first point} x1 
 * @param {y Position of the first point} y1 
 * @param {x Position of the second point} x2 
 * @param {y Position of the second point} y2 
 */
function distance(x1,y1,x2,y2){
    return sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
}

/**
 * Generalized class to display an image and have movement with acceleration
 */
class PhysicsObject{

    constructor(initXPosition,initYPosition,initXVelocity,initYVelocity,initXAcceleration,initYAcceleration,initWidth,initHeight,type){
        this.xPosition = initXPosition;
        this.yPosition = initYPosition;
        this.xVelocity = initXVelocity;
        this.yVelocity = initYVelocity;
        this.xAcceleration = initXAcceleration;
        this.yAcceleration = initYAcceleration;
        this.width = initWidth;
        this.height = initHeight
        this.color = [0,0,0];
        this.type = type
    }

    move(){
        this.xVelocity += this.xAcceleration;
        this.xPosition += this.xVelocity;
        this.yVelocity += this.yAcceleration;
        this.yPosition += this.yVelocity;
        if(this.xPosition > CANVAS_WIDTH){
            this.xPosition = CANVAS_WIDTH;
            this.xVelocity *= -reflectionFactor;
        }
        if(this.xPosition < 0){
            this.xPosition = 0;
            this.xVelocity *= -reflectionFactor;
        }
        if(this.yPosition > CANVAS_HEIGHT){
            this.yPosition = CANVAS_HEIGHT;
            this.yVelocity *= -reflectionFactor;
        }
        if(this.yPosition < 0){
            this.yPosition = 0;
            this.yVelocity *= -reflectionFactor;
        }
    }

    draw(){
        //fill(this.color)
        // ellipse(this.xPosition,this.yPosition,this.width,this.height);
    }

    onClick(){
        this.direction = !this.direction;
    }
}


/**
 * Goomba objects
 */
class Goomba{

    constructor(initXPosition,initYPosition,initXVelocity,initYVelocity,initWidth,initHeight,initPlatformWidth,initPlatformVelocity){
        this.xPosition = initXPosition;
        this.leftBound = initXPosition;
        this.rightBound = initXPosition + initPlatformWidth-initWidth;
        this.yPosition = initYPosition;
        this.xVelocity = initXVelocity;
        this.yVelocity = initYVelocity;
        this.xAcceleration = 0;
        this.yAcceleration = 0;
        this.width = initWidth;
        this.height = initHeight;
        this.isDead = false;
        this.platformVelocity = initPlatformVelocity
    }

    move(){
        this.xVelocity += this.xAcceleration;
        this.xPosition += this.xVelocity + this.platformVelocity;
        this.yVelocity += this.yAcceleration;
        this.yPosition += this.yVelocity;
        this.leftBound  += this.platformVelocity
        this.rightBound += this.platformVelocity
        if(this.xPosition > this.rightBound && !this.isDead){
            this.xPosition = this.rightBound;
            this.xVelocity *= -1;
        }
        if(this.xPosition < this.leftBound && !this.isDead){
            this.xPosition = this.leftBound;
            this.xVelocity *= -1;
        }
    }

    draw(){
        if(!this.isDead){
            if(counter%30<15){
                image(GOOMBA_1_IMAGE,this.xPosition,this.yPosition,this.width,this.height);
            } else {
                image(GOOMBA_2_IMAGE,this.xPosition,this.yPosition,this.width,this.height);
            }
        } else {
            image(GOOMBA_DEAD_IMAGE,this.xPosition,this.yPosition,this.width,this.height);
        }
    }

    kill(){
        this.yVelocity = -10
        this.yAcceleration = .5
        this.isDead = true
    }

    onClick(){
        this.direction = !this.direction;
    }
}

/**
 * Class for background clouds
 */
class CloudObject{

    constructor(initXPosition,initYPosition,initXVelocity,initYVelocity,initWidth,initHeight,isLarge){
        this.xPosition = initXPosition;
        this.yPosition = initYPosition;
        this.xVelocity = initXVelocity;
        this.yVelocity = initYVelocity;
        this.width = initWidth;
        this.height = initHeight
        this.isLarge = isLarge
    }

    move(){
        this.xPosition += this.xVelocity;
        this.yPosition += this.yVelocity;
        if(this.xPosition > CANVAS_WIDTH){
            this.xPosition = CANVAS_WIDTH;
        }
        if(this.xPosition < 0){
            this.xPosition = 0;
        }
        if(this.yPosition > CANVAS_HEIGHT){
            this.yPosition = CANVAS_HEIGHT;
        }
        if(this.yPosition < 0){
            this.yPosition = 0;
        }
    }

    draw(){
        if(this.isLarge){
            image(CLOUD_LARGE_IMAGE,this.xPosition,this.yPosition,this.width*2,this.height);
        }
        else{
            image(CLOUD_SMALL_IMAGE,this.xPosition,this.yPosition,this.width,this.height);

        }
    }
}

/**
 * Class for platform objects
 */
class PlatformObject{

    constructor(initXPosition,initYPosition,initXVelocity,initYVelocity,initWidth,initHeight,initLength,hasPipe){
        this.xPosition = initXPosition;
        this.yPosition = initYPosition;
        this.xVelocity = initXVelocity;
        this.yVelocity = initYVelocity;
        this.width = initWidth*initLength;
        this.widthPerBlock = initWidth;
        this.height = initHeight;
        this.length = initLength;
        if(hasPipe){
            this.pipeLocation = Math.floor(Math.random()*this.length)
        }
        else{
            this.pipeLocation = -1
        }
    }

    move(){
        this.xPosition += this.xVelocity;
        this.yPosition += this.yVelocity;
        // if(this.xPosition > CANVAS_WIDTH){
        //     this.xPosition = CANVAS_WIDTH;
        // }
        // // if(this.xPosition < 0){
        // //     this.xPosition = 0;
        // // }
        // if(this.yPosition > CANVAS_HEIGHT){
        //     this.yPosition = CANVAS_HEIGHT;
        // }
        // if(this.yPosition < 0){
        //     this.yPosition = 0;
        // }
    }

    draw(){
        for(let i = 0; i < this.length; i++){
            image(BRICK_IMAGE,this.xPosition+i*this.widthPerBlock,this.yPosition,this.widthPerBlock,this.height);
            if(i==this.pipeLocation){
                image(PIPE_IMAGE,this.xPosition+i*this.widthPerBlock,this.yPosition-this.height,this.widthPerBlock,this.height);
            }
        }
    }

    onClick(){
        this.direction = !this.direction;
    }
}

/**
 * Class for the Mario object
 */
class MarioObject{

    constructor(initXPosition,initYPosition,initWidth,initHeight){
        this.xPosition = initXPosition;
        this.yPosition = initYPosition;
        this.xSpeed = 8;
        this.xVelocity = 0;
        this.yVelocity = 1;
        this.ySpeed = 1;
        this.yAcceleration = .5;
        this.width = initWidth;
        this.height = initHeight;
        this.direction = 0;
        this.facing = 1;
        this.jumpSpeed = 20
        this.isJumping = true;
        this.hurtCount=0;
        this.imageCount=0;
    }

    move(direction){
        this.direction = direction
        if(direction!=0){
            this.facing = direction
        }
    }

    update(){
        // Y
        this.yVelocity += this.yAcceleration;
        this.yPosition += this.yVelocity;
        if(this.yPosition > CANVAS_HEIGHT-this.height && this.yAcceleration>0){
            this.yPosition = 0;
            this.yVelocity = 0;
            points *= .9
        }
        if(this.yPosition < 0 && this.yAcceleration<0){
            this.yPosition = CANVAS_HEIGHT-this.height;
            this.yVelocity = 0;
            points *= .9
        }
        // X
        if(this.hurtCount==0){
            this.xVelocity = this.xSpeed * this.direction;
            if(this.direction != 0){
                this.imageCount = (this.imageCount+1)%10000000
            }
        }
        this.xPosition += this.xVelocity - 5;
        if(this.xPosition > CANVAS_WIDTH-this.width){
            this.xPosition = CANVAS_WIDTH-this.width;
        }
        if(this.xPosition < 0){
            this.xPosition = 0;
        }
        this.hurtCount = Math.max(this.hurtCount-1,0)
    }

    jump(){
        this.yVelocity -= this.jumpSpeed;
        this.yPosition--;
        this.isJumping = true;
    }

    hurt(direction){
        if(direction=="left"){
            this.yVelocity = -this.jumpSpeed/2
            this.xVelocity = -this.jumpSpeed/2
        } else {
            this.yVelocity = -this.jumpSpeed/2
            this.xVelocity = this.jumpSpeed/2
        }
        this.hurtCount = 30 // Frames hurt for
        this.isJumping == true;
    }

    invertGravity(){
        if(!this.isJumping){
            this.yAcceleration *= -1
            this.jumpSpeed *= -1
            this.yPosition -= this.height*2*Math.sign(this.yAcceleration)
        }
    }

    draw(){
        let jumpImage = MARIO_JUMPING_IMAGE
        let standImage = MARIO_STANDING_1_IMAGE
        if(this.imageCount%10<5){
            standImage = MARIO_STANDING_1_IMAGE
        } else {
            standImage = MARIO_STANDING_2_IMAGE
        }   
        if(this.yAcceleration<0){
            jumpImage = MARIO_JUMPING_INVERTED_IMAGE
            if(this.imageCount%10<5){
                standImage = MARIO_STANDING_1_INVERTED_IMAGE
            } else {
                standImage = MARIO_STANDING_2_INVERTED_IMAGE
            }   
        }
        if(this.facing < 0){
            translate(width,0);
            scale(-1,1)
            if(this.yVelocity<0){
                image(jumpImage,CANVAS_WIDTH-this.xPosition-this.width,this.yPosition,this.width,this.height);
            }
            else{
                image(standImage,CANVAS_WIDTH-this.xPosition-this.width,this.yPosition,this.width,this.height);
            }
            translate(0,0);
            scale(1,1)
        }
        else{
            if(Math.sign(this.yVelocity)!=Math.sign(this.yAcceleration) && this.yVelocity != 0){
                image(jumpImage,this.xPosition,this.yPosition,this.width,this.height);
            }
            else{
                image(standImage,this.xPosition,this.yPosition,this.width,this.height);
            }
        }
    }

    onClick(){
        this.direction = !this.direction;
    }
}