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

//Forces
var wind = new Vec2(-0.3, -0.02);
var gravity = new Vec2(0, 0.1);


//Init document
$(document).ready(function () {

    g_requestAnimFrame();
    setupListeners();

    $('#window').css('width', window.innerWidth - 30);
    $('#window').css('height', window.innerHeight - 50);

    

    /*get context*/
    canvas = document.getElementById('test');
    ctx = canvas.getContext('2d');
    canvas.width = $('#window').width();
    canvas.height = $('#window').height() - 100;

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
    ballsCounter: 0,
    followMouse: false,
    applyFriction: false,
    applyGravity: true,
    applyWind: false
}

//Setup listeners
function setupListeners() {

    //Mouse listener
    $('#test').mousemove(function (e) {
        mx = e.pageX - canvas.offsetLeft;
        my = e.pageY - canvas.offsetTop;
    }).click(function (e) {
        if (setup.spawnAttractor) {
            $('#spawnAttractor').prop('checked', false);
            setup.spawnAttractor = false;
            return entities.push(new Attractor(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop));
        }
        entities.push(new Ball(e.pageX - canvas.offsetLeft, e.pageY - canvas.offsetTop, Math.floor(Math.random() * 12) + 2));
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
        water.width = canvas.width;
        water.y = canvas.height - 150;
        showWater();
    });
    $('#spawnAttractor').change(function () {
        setup.spawnAttractor = $(this).prop('checked');
    });
	
	$(document).keyup(function(e){
		//modify wind value
		var kc = e.keyCode;
		if(kc === 37)
			wind.x-= 0.1;
		if(kc === 39)
			wind.x+=0.1;
		if(kc === 38)
			wind.y-=0.1;
		if(kc === 40)
			wind.y+=0.1;
	});
}




/*
=====================
Render
=====================
*/
var water = {
    x:      0,
    y:      410 - 150,
    width:  null,
    height: 150,
    c:      0.3          /*drag coefficient*/
}

//Render water
function showWater() {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = 'blue';
    ctx.globalAlpha = 0.5;
    ctx.rect(water.x, water.y, water.width, water.height);
    ctx.fill();
    ctx.restore();
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (i in entities) {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.globalAlpha = 1;
        ctx.arc(entities[i].location.x, entities[i].location.y, entities[i].mass * 2, Math.PI * 2, false);
        ctx.fill();
        ctx.restore();
    }

    //Render water
    if (setup.showWater)
        showWater();
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

//Update objects
function update() {
    for (i in entities) {
        entities[i].update();
    }
}

//Ball object
function Ball(x, y, mass) {

    //Properties
    this.location     = new Vec2(x, y);
    this.vel          = new Vec2(0, 0);
    this.acceleration = new Vec2(0, 0);
    this.topspeed     = 10;
    this.mass         = !mass ? 1 : mass;


    /*
    =====================
    Move
    =====================
    */
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
        var grav = new Vec2(0, gravity.y * this.mass);
        if (setup.applyGravity) {
            this.applyForce(grav);
        }
        
        //Apply friction
        var relFriction = this.vel.getCopy();
        relFriction.mul(-1);
        relFriction.normalize();
        relFriction.mul(/*coefficient of friction*/ 0.1 * /*normal force (perpendicular to object)*/ 1);
        if(setup.applyFriction)
            this.applyForce(relFriction);
        
        //Drag
        if (setup.showWater)
            if (this.isInside(water))
                this.drag(water);
        
        //Accelerate
        this.vel.add(this.acceleration);
        this.vel.limit(this.topspeed);
        this.location.add(this.vel);

        //Reset acceleration
        this.acceleration.mul(0);
        this.checkEdges();
    }


    /*
    =====================
    Apply force
    =====================
    */
    this.applyForce = function (force) {
        this.acceleration.add( new Vec2.prototype.div(force, this.mass) );
    }


    /*
    =====================
    Drag
    =====================
    */
    this.drag = function (liquid) {

        var speed          = this.vel.magnitude();
        var dragMagnitude  = liquid.c * speed * speed;
        var dragVec        = this.vel.getCopy();

        dragVec.mul(-1);
        dragVec.setMag(dragMagnitude);

        //Apply drag
        this.applyForce(dragVec);
    }


    /*
    =====================
    Check edges
    =====================
    */
    this.checkEdges = function () {
        if (this.location.x > canvas.width) {
            this.location.x = canvas.width;
            this.vel.x *= -1;
        }
        else if (this.location.x < 0) {
            this.vel.x *= -1;
            this.location.x = 0;
        }

        if (this.location.y > canvas.height)
        {
            this.vel.y *= -1;
            this.location.y = canvas.height;
        }
    }



    /*
    =====================
    Is inside
    =====================
    */
    this.isInside = function (/*liquid*/ l) {
        if (this.location.x > l.x && this.location.x < l.x + l.width && this.location.y > l.y && this.location.y < l.y + l.height) {
            return true;
        }
        return false;
    }
}





function Attractor(x, y) {
    
    this.mass       = 50;
    this.location   = new Vec2(x, y);
    this.G          = 10;


    this.update = function () {
        var fvec = null;

        for (var i in entities) {
            fvec = this.attract(entities[i]);
            entities[i].applyForce(fvec);
        }
    }


    this.attract = function (object) {
        //Calculate force
        var force = new Vec2.prototype.sub(this.location, object.location);
        var distance = force.magnitude();

        force.normalize();
        distance = constrain(distance, this.mass * 2 + 20, this.mass * 2 + 100);
        
        var m = (this.G * this.mass * object.mass) / (distance * distance);

        force.mul(m);

        return force;
    }

    this.applyForce = function () {

    }
}


function constrain(value, min, max) {
    if (value < min)
        return  min;
    if (value > max)
        return max;
    return value;
}




