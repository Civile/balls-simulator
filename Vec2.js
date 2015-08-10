
/*
=====================
Vector 2d
=====================
*/


function Vec2(x, y) {
    
    //Properties
    this.x = x;
    this.y = y;


    this.add = function (/*vec2*/ v) {
        this.x = this.x + v.x;
        this.y = this.y + v.y;
    }


    this.sub = function (/*vec2*/ v) {
        this.x = this.x - v.x;
        this.y = this.y - v.y;
    }


    this.mul = function (/*scalar*/ s) {
        this.x = this.x * s;
        this.y = this.y * s;
    }


    this.divide = function (/*scalar*/ n) {
        this.x = this.x / n;
        this.y = this.y / n;
    }


    this.magnitude = function () {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }


    this.normalize = function () {
        var m = this.magnitude();
        if (m != 0)
            this.divide(m);
    }


    this.setMag = function ( /*scalar*/ m) {
        this.normalize();
        this.mul(m);
    }


    this.dot = function (/*vec2*/ v) {
        return this.x * v.x + this.y * v.y;
    }


    this.limit = function ( /*scalar*/ l) {
        if (this.magnitude() > l)
            this.setMag(l);
    }

    this.getCopy = function () {
        return copy = new Vec2(this.x, this.y);
    }
}



//Static - return a Vec2d
Vec2.prototype.sub = function (v1, v2) {
    return new Vec2(v1.x - v2.x, v1.y - v2.y);
}

Vec2.prototype.add = function (v1, v2) {
    return new Vec2(v1.x + v2.x, v1.y + v2.y);
}

Vec2.prototype.mul = function (v1, s) {
    return new Vec2(v1.x * s, v1.y * s);
}

Vec2.prototype.div = function (v1, s) {
    return new Vec2(v1.x / s, v1.y / s);
}




Vec2.prototype.getAngle = function () {
    return Math.atan2(this.y, this.x);
}


Vec2.prototype.translate = function (/*scalar*/ destX, /*scalar*/ destY) {
    this.x = this.x + destX;
    this.y = this.y + destY;
}


Vec2.prototype.rotate = function (/**/) {

}

