
const globalScale = 300;
const originX = -78.7;
const originY = 44.3;
const lakeXscale = 0.75;
const lakeYscale = -1;

function Vector2(x, y) {
    this.x = x;
    this.y = y;
}

export function real_coords_to_lake(coords) {
    return new Vector2(
        (coords[0] - originX)*lakeXscale*globalScale,
        (coords[1] - originY)*lakeYscale*globalScale
    );
}

//Canvas
export async function drawLakes(ctx, canvasCenterX, canvasCenterY) {

    let canvasCenter = new Vector2(canvasCenterX, canvasCenterY)

    let obj;

    const res = await fetch('./lakes.json')

    obj = await res.json();

    let i = 0;

    while (i < obj.length) {

        let lakeobj = obj[i]['coords']

        //Draw
        let j = 1;
        ctx.beginPath();

        //Plot First Point
        let point = real_coords_to_lake(lakeobj[0])
        ctx.moveTo(point.x + canvasCenter.x, point.y + canvasCenter.y);
        console.log(point)

        //PLot Other Points
        while (j < lakeobj.length) {

            let newpoint = real_coords_to_lake(lakeobj[j])
            ctx.lineTo(newpoint.x + canvasCenter.x, newpoint.y + canvasCenter.y);
            //console.log(newpoint)

            j++;
        }

        //Finish
        ctx.closePath();
        ctx.fill();

        //Continue
        i++;
    }


    /*
    ctx.beginPath();
    ctx.moveTo(200, 0);
    ctx.lineTo(100,50);
    ctx.lineTo(50, 100);
    ctx.lineTo(200, 90);
    ctx.closePath();
    ctx.fill();
    */

}
