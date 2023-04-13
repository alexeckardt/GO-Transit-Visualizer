//Comment

function Vector2(x, y) {
    this.x = x;
    this.y = y;
}

function Circle(pos, radius) {
    this.radius = radius;
    this.position = pos;
    this.fill = 'black';

    this.draw = function(ctx) {

        var x = this.position.x;
        var y = this.position.y;

        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, 2 * Math.PI, false);

        ctx.fillStyle = this.fill;
        ctx.fill();

    }
}

//Canvas
const canvas = document.getElementById('myCanvas');
let ctx = canvas.getContext('2d');

//Generate
const circle = new Circle(new Vector2(50, 50), 10);
circle.draw(ctx);

const circle2 = new Circle(new Vector2(80, 60), 10);
circle2.draw(ctx);
