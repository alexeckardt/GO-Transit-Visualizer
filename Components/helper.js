
export function Vector2(x, y) {
    this.x = x;
    this.y = y;

    this.add = function(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    this.subtract = function(other) {
        return new Vector2(this.x - other.x, this.y - other.y);
    }

    this.multiply = function(other) {
        return new Vector2(this.x * other.x, this.y * other.y);
    }

    this.scale = function(factor) {
        return new Vector2(this.x*factor, this.y*factor);
    }

    this.floored = function() {
        return new Vector2(Math.floor(this.x), Math.floor(this.y));
    }

    this.distance = function(otherVector2) {
        var xx = this.x-otherVector2.x;
        var yy = this.y-otherVector2.y;
        return Math.sqrt(xx*xx + yy*yy);
    }
}
Vector2.prototype.toString = function() {
    return "V2:(" + this.x + ", " + this.y + ")";
}

export function toVector2(jsonTuple) {
    return new Vector2(jsonTuple[0], jsonTuple[1])
}