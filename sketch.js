//import { ColorCycler } from "./ColorCycler";

var CANVAS_HEIGHT = 800;
var CANVAS_WIDTH  = 1600;
let FPS = 60;
let objects = [];
let isMousePreviouslyPressed = false;
let STOCK_DATA;
let MARIO_STANDING_IMAGE;
let MARIO_JUMPING_IMAGE;
let counter = 0;
let MARIO_OBJECT;
let CSV_INDEX = 0;
let TRANSLATION=0;

function setup(){
    CANVAS_HEIGHT = windowHeight;
    CANVAS_WIDTH  = windowWidth;
    cnv = createCanvas(CANVAS_WIDTH,CANVAS_HEIGHT);
    frameRate(FPS);
    textAlign(CENTER, CENTER);
    textSize(40)
    background(255);
    setupObjects();
    cursor(CROSS)

    fill(0);
    console.log(STOCK_DATA)
}

function keyPressed() {
    if (keyCode === UP_ARROW) {
        MARIO_OBJECT.jump()
    }
}

function preload(){
    STOCK_DATA = loadTable("data/NTDOY.csv","header")
    MARIO_STANDING_IMAGE = loadImage("images/mario_standing.png")
    MARIO_JUMPING_IMAGE = loadImage("images/mario_jumping.png")
    BRICK_IMAGE = loadImage("images/brick.png")
    LOGO_IMAGE = loadImage("images/nintendo_logo.jpg")
}

function setupObjects(){
    MARIO_OBJECT = new MarioObject(50,50,50,50);
}

function draw(){
    background(255);
    handleInput();
    handleCollisions();
    generatePlatform();
    drawObjects();
    handleCounter();
    isMousePreviouslyPressed = mouseIsPressed;
}

function generatePlatform(){
    if(counter%(60*1/60)==0){
        console.log(STOCK_DATA.rows.length)
        let size = 50
        let height = STOCK_DATA.rows[CSV_INDEX].obj.Open*10;

        // if(CSV_INDEX == 0){
        //     height = 0
        // }

        objects.push(new PlatformObject(CANVAS_WIDTH,CANVAS_HEIGHT-size-height,-5,0,size,size,1))



        console.log(CSV_INDEX)
        incrementCSVIndex();
    }
}

function drawObjects(){
    image(LOGO_IMAGE,0,0,LOGO_IMAGE.width/2,LOGO_IMAGE.height/2);
    fill(100);
    text("Date: "+STOCK_DATA.rows[CSV_INDEX].obj.Date, LOGO_IMAGE.width/4, LOGO_IMAGE.height/2);
    fill(100);
    text("Price: "+STOCK_DATA.rows[CSV_INDEX].obj.Open, LOGO_IMAGE.width/4, LOGO_IMAGE.height/2+50);
    objects.map(currentObject => {
        currentObject.move();
        currentObject.draw();
    });
    if(objects[0].xPosition==0){
        objects.splice(0,1)
    }
    MARIO_OBJECT.draw()
    MARIO_OBJECT.update()
}

function handleCollisions(){
    objects.map(obj1 => {

    });
}

function handleCounter(){
    counter++;
    if(counter > 1000000000){
        counter=0;
    }
}

function handleInput(){
    if (keyIsDown(LEFT_ARROW)) {
        MARIO_OBJECT.move(-1)
    } else if (keyIsDown(RIGHT_ARROW)) {
        MARIO_OBJECT.move(1)
    } else {
        MARIO_OBJECT.move(0)
    }
}

function incrementCSVIndex(){
    CSV_INDEX = (CSV_INDEX+1)%(STOCK_DATA.rows.length)
}

function isCollisionRectangle(x1,width1,y1,height1,x2,width2,y2,height2){
    return x1 < (x2+width2) && (x1+width1) > x2 &&
           y1 < (y2+height2) && (y1+height1) > y2;
}

function isCollisionCircle(x1,y1,r1,x2,y2,r2){
    return distance(x1,y1,x2,y2) < r1+r2;
}

function distance(x1,y1,x2,y2){
    return sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
}

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



class PlatformObject{

    constructor(initXPosition,initYPosition,initXVelocity,initYVelocity,initWidth,initHeight,initLength){
        this.xPosition = initXPosition;
        this.yPosition = initYPosition;
        this.xVelocity = initXVelocity;
        this.yVelocity = initYVelocity;
        this.width = initWidth;
        this.height = initHeight;
        this.length = initLength
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
        for(let i = 0; i < this.length; i++){
            image(BRICK_IMAGE,this.xPosition+i*this.width,this.yPosition,this.width,this.height);
        }
    }

    onClick(){
        this.direction = !this.direction;
    }
}

class MarioObject{

    constructor(initXPosition,initYPosition,initWidth,initHeight){
        this.xPosition = initXPosition;
        this.yPosition = initYPosition;
        this.xSpeed = 3;
        this.xVelocity = 0;
        this.yVelocity = 1;
        this.ySpeed = 1;
        this.yAcceleration = .5;
        this.width = initWidth;
        this.height = initHeight;
        this.direction = 0;
        this.facing = 1;
        this.jumpSpeed = 20
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
        if(this.yPosition > CANVAS_HEIGHT-this.height){
            this.yPosition = CANVAS_HEIGHT-this.height;
            this.yVelocity = 0
        }
        if(this.yPosition < 0){
            this.yPosition = 0;
            this.yVelocity = 0;
        }
        // X
        this.xVelocity = this.xSpeed * this.direction;
        this.xPosition += this.xVelocity;
        if(this.xPosition > CANVAS_WIDTH-this.width){
            this.xPosition = CANVAS_WIDTH-this.width;
        }
        if(this.xPosition < 0){
            this.xPosition = 0;
        }
    }

    jump(){
        this.yVelocity -= this.jumpSpeed;
    }



    draw(){
        if(this.facing < 0){
            translate(width,0);
            scale(-1,1)
            if(this.yVelocity<0){
                image(MARIO_JUMPING_IMAGE,CANVAS_WIDTH-this.xPosition-this.width,this.yPosition,this.width,this.height);
            }
            else{
                image(MARIO_STANDING_IMAGE,CANVAS_WIDTH-this.xPosition-this.width,this.yPosition,this.width,this.height);
                
            }
            translate(0,0);
            scale(1,1)
        }
        else{
            if(this.yVelocity<0){
                image(MARIO_JUMPING_IMAGE,this.xPosition,this.yPosition,this.width,this.height);
            }
            else{
                image(MARIO_STANDING_IMAGE,this.xPosition,this.yPosition,this.width,this.height);
            }
        }
    }

    onClick(){
        this.direction = !this.direction;
    }
}