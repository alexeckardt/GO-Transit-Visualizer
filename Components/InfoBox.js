import { backgroundCol, busStopCol, descFont, selectedBusStopCol, titleFont } from "./Colors.js";

export function InfoBox(infoCanvas) {
    this.title = "Empty";
    this.descLines = ["Empty"];
    this.routesToDraw = [];

    this.draw_box = false;

    this.edgeBuffer = 15;

    this.canvas = infoCanvas;
    this.ctx = function() {
        return this.canvas.getContext('2d')}

    this.set_dimentions = function(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.setAttribute('width', width);
        this.canvas.setAttribute('height', height);
    }

    this.set_text = function(title, desc) {
        this.title = title;
        this.descLines = [];
        let split = desc.split("\n");

        let maxLineLength = (this.width - this.edgeBuffer*2) / 10; // 10 for font approx

        //Word Wrap
        //Over Line
        for (var i = 0; i < split.length; i++) {
            let line = split[i];
            let lineStr = "";

            //Add to string
            for (var j = 0; j < line.length; j++) {
                let curChar = line[j];
                lineStr += curChar;

                //Add Line
                if (lineStr.length >= maxLineLength) {
                    this.descLines.push(lineStr)
                    lineStr = "";
                }
            }

            if (lineStr != "") {
                this.descLines.push(lineStr)
            }
        }
        
        this.draw_box = true;
    }

    this.clear = function() {
        this.title = "";
        this.descLines = "";
        this.routesToDraw = [];
        this.draw_box = false;
    }

    this.show = function() {
        this.draw_box = true;
    }

    this.update = function() {

        let ctx = this.ctx();

        if (!this.draw_box) {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }

        const b = this.edgeBuffer;

        //Clear
        ctx.fillStyle = backgroundCol;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.fillStyle = selectedBusStopCol;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = titleFont;
        ctx.fillText(this.title, b, b);

        ctx.fillStyle = busStopCol;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = descFont;
        
        let lineHeight = 25;
        let titleHeight = 20;

        for (var i=0; i < this.descLines.length; i++) {
            let line = this.descLines[i];
            ctx.fillText(line, b, b*2+titleHeight+lineHeight*i);
        }
    }
}