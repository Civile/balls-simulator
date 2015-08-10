/*
=====================
Request animation frame
=====================
*/
(function () {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
})();

function g_requestAnimFrame() {
    //Request animation frame
    window.cancelRequestAnimFrame = (function () {
        return window.cancelAnimationFrame ||
            window.webkitCancelRequestAnimationFrame ||
            window.mozCancelRequestAnimationFrame ||
            window.oCancelRequestAnimationFrame ||
            window.msCancelRequestAnimationFrame ||
            clearTimeout
    })();
}


/*
=====================
Initialize
=====================
*/
var canvas;
var ctx;
var ball;
var entities = new Array();
var mx, my;


$(document).ready(function () {

    g_requestAnimFrame();
    setupListeners();

    /*get context*/
    canvas = document.getElementById('test');
    ctx = canvas.getContext('2d');
    canvas.width = 900;
    canvas.height = 410;

    /*add initial balls*/
    for (var i = 0; i < setup.ballsCounter; i++)
        entities.push(new Ball(Math.random() * canvas.width + 1, Math.random() * canvas.width + 1, Math.random() * 5 + 1));

    loop();
});



/*
=====================
Setup
=====================
*/
var setup = {
    ballsCounter: 2,
    followMouse: false,
    applyFriction: true,
    applyGravity: true,
    applyWind: true
}

function setupListeners() {

    //Mouse listener
    $('#test').mousemove(function (e) {
        mx = e.pageX - canvas.offsetLeft;
        my = e.pageY - canvas.offsetTop;
    }).click(function (e) {
        entities.push(new Ball(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop, Math.random() * 10 + 1));
        setup.ballsCounter++;
        $('.ballsCounter').text('Balls:' + setup.ballsCounter);
    });

    $('#followMouse').change(function () {
        setup.followMouse = $(this).prop('checked');
    });
    $('#applyFriction').change(function () {
        setup.applyFriction = $(this).prop('checked');
    });
    $('#applyGravity').change(function () {
        setup.applyGravity = $(this).prop('checked');
    });
    $('#applyWind').change(function () {
        setup.applyWind = $(this).prop('checked');
    });
    $('#showWater').change(function () {
        setup.showWater = $(this).prop('checked');
        showWater();
    });
}


var water = {
    x: 0,
    y: 410 - 200,
    width: 900,
    height: 200,
    c: 0.1
}


function showWater() {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = 'blue';
    ctx.globalAlpha = 0.5;
    ctx.rect(water.x, water.y, water.width, water.height);
    ctx.fill();
    ctx.restore();
}



/*
=====================
Game
=====================
*/
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}


//Forces
var wind = new Vec2(-0.45, -0.1);
var gravity = new Vec2(0, 0.30);

function update() {

    for (i in entities) 
        entities[i].update();
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (i in entities)
    {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.globalAlpha = 1;
        ctx.arc(entities[i].location.x, entities[i].location.y, entities[i].mass * 2, Math.PI * 2, false);
        ctx.fill();
        ctx.restore();
    }

    if (setup.showWater)
        showWater();
}







function Ball(x, y, mass) {

    this.location     = new Vec2(x, y);
    this.vel          = new Vec2(0, 0);
    this.acceleration = new Vec2(null, null);
    this.topspeed     = 20;
    this.mass         = mass != null ? mass : 1;


    this.update = function () {

        //Follow mouse
        var mouse = new Vec2(mx, my);
        var dir = Vec2.prototype.sub(mouse, this.location);
        dir.normalize();
        dir.mul(0.5);
        if(setup.followMouse)
            this.acceleration = dir;

        //Apply forces
        if(setup.applyWind)
            this.applyForce(wind);
        //Apply mass-relative gravity
        relGravity = gravity.getCopy();
        relGravity.y *= this.mass;
        if (setup.applyGravity)
            this.applyForce(relGravity);

        //Apply fricion
        var relFriction = this.vel.getCopy();
        relFriction.mul(-1);
        relFriction.normalize();
        relFriction.mul(/*coefficient of friction*/ 0.1 * /*normal force (perpendicular to object)*/ 1);
        if(setup.applyFriction)
            this.applyForce(relFriction);

        if (setup.showWater)
            if (this.isInside(water))
                this.drag(water);

        //Check collision
        this.checkEdges();

        if (!isNaN(this.acceleration.x) && !isNaN(this.acceleration.y)) {
            this.vel.add(this.acceleration);
            this.vel.limit(this.topspeed);
        }
        this.location.add(this.vel);

        //Reset acceleration
        this.acceleration.mul(0);
    }




    this.applyForce = function (force) {
        var forceR = new Vec2.prototype.div(force, this.mass);
        this.acceleration.add(forceR);
    }



    this.drag = function (liquid) {
        var speed = this.vel.magnitude();
        var dragMagnitude = liquid.c * speed * speed;

        var dragVec = this.vel.getCopy();
        dragVec.mul(-1);
        dragVec.normalize();
        dragVec.mul(dragMagnitude);
        this.applyForce(dragVec);
    }


    this.checkEdges = function () {
        if (this.location.x > canvas.width) {
            this.location.x = canvas.width;
            this.vel.x *= -1;
        }
        else if (this.location.x <= 0) {
            this.location.x = 0;
            this.vel.x *= -1;
        }

        if (this.location.y >= canvas.height)
        {
            this.vel.y *= -1;
            this.location.y = canvas.height;
        }
    }


    this.isInside = function (/*liquid*/ l) {
        if (this.location.x > l.x && this.location.x < l.x + l.width && this.location.y > l.y && this.location.y < l.y + l.height)
            return true;
        return false;
    }
}




