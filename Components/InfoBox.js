import { backgroundCol, busStopCol, defFont, descFont, gridLineCol, routeFont, selectedBusStopCol, titleFont } from "./Style.js";
import { mouse } from "./Mouse.js";
import { G } from "../Visual/Graph.js";

export function InfoBox(infoCanvas) {
    this.title = "Empty";
    this.smallDescLines = ["Empty"];
    this.descLines = ["Empty"];
    this.routesToDraw = [];
    this.expanded = false;

    this.draw_box = false;

    this.edgeBuffer = 15;
    this.routeBoxSep = this.edgeBuffer/2;
    
    this.routeBoxWidth = 40;
    this.routeBoxHeight = -1;

    this.routeBoxXOffset = 0;

    this.canvas = infoCanvas;
    this.ctx = function() {
        return this.canvas.getContext('2d')}

    this.titleCol = 'black';
    this.descCol = 'black';

    this.set_dimentions = function(width, height, routeSelectorHeight, edgeBuffer) {
        this.width = width;
        this.height = height;
        this.edgeBuffer = edgeBuffer;
        this.canvas.setAttribute('width', width);
        this.canvas.setAttribute('height', height+routeSelectorHeight);

        this.routeBoxHeight = routeSelectorHeight - 2*this.edgeBuffer;
        this.routeBoxSep = this.edgeBuffer/2;
    }

    this.set_text = function(title, smalldesc, desc) {
        this.title = title;
        this.smallDescLines = smalldesc.split("\n");
        if (this.smallDescLines.length == 1 && this.smallDescLines[0] == ""){
            this.smallDescLines = [];
        }
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

                    let tryGoBack = lineStr.length;
                    let orgLineStr = lineStr;
                    let orgJ = j;
                    let pushed = false;
                    while (tryGoBack > 0) {
                        j--;
                        lineStr = lineStr.substring(0, lineStr.length-1);

                        console.log(lineStr);

                        if (line[j] == ' ') {
                            console.log('Pushed!', lineStr)
                            this.descLines.push(lineStr)
                            tryGoBack = -100; //end here, continue
                            pushed = true;
                            lineStr = "        "; //Add a tab
                        }
                    }

                    if (!pushed) {
                        j = orgJ
                        this.descLines.push(orgLineStr)
                        lineStr = "";
                    }
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
        this.routeBoxXOffset = 0;

        this.setBusstopScheme();
    }

    this.show = function() {
        this.draw_box = true;
        this.routeBoxXOffset = 0;
    }

    this.setBusstopScheme = function() {
        this.setCustomScheme(selectedBusStopCol, busStopCol);
    }

    this.setCustomScheme = function(titleCol, descCol) {
        this.titleCol = titleCol;
        this.descCol = descCol;
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
        ctx.strokeStyle = gridLineCol;
        ctx.lineWidth = 2;
        ctx.fillRect(0, 0, this.width, this.height+5);
        ctx.strokeRect(0, 0, this.width, this.height+5);

        ctx.fillStyle = this.titleCol;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = titleFont;
        ctx.fillText(this.title, b, b);

        ctx.fillStyle = this.descCol;
        ctx.font = defFont;
        
        let lineHeight = 10;
        let titleHeight = 20;

        for (var i=0; i < this.smallDescLines.length; i++) {
            let line = this.smallDescLines[i];
            ctx.fillText(line, b, b*2+titleHeight+lineHeight*i);
        }

        let base = (this.smallDescLines.length != 0) ? 20 : 13;
        titleHeight = base + this.smallDescLines.length*lineHeight+this.edgeBuffer/2;
        lineHeight = 25;

        ctx.fillStyle = this.descCol;
        ctx.font = descFont;

        for (var i=0; i < this.descLines.length; i++) {
            let line = this.descLines[i];
            ctx.fillText(line, b, b*2+titleHeight+lineHeight*i);
        }

        //
        //
        // Selected Routes
        //
        //

        //Clear
        let routes = mouse.selectedRoutes
        if (routes.length > 0) {
            ctx.fillStyle = backgroundCol;
            ctx.strokeStyle = gridLineCol;
            ctx.lineWidth = 2;
            ctx.fillRect(0, this.height, this.width, this.canvas.height-this.height);
            ctx.strokeRect(0, this.height, this.width, this.canvas.height-this.height);
        
            let boxY = this.height + this.edgeBuffer;
            let boxW = this.routeBoxWidth;
            let boxH = this.routeBoxHeight;

            //Draw the selected routes
            for (var i = 0; i < routes.length; i++) {

                var boxX = this.edgeBuffer + (boxW+this.routeBoxSep)*i - this.routeBoxXOffset;

                let route = routes[i];
                let data = G.route_data[route];

                ctx.fillStyle = "#" + data.route_color;
                ctx.beginPath();
                ctx.roundRect(boxX, boxY, boxW, boxH, 5);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = "#" + data.route_text_color;
                ctx.font = routeFont;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(data.route_short_name, boxX + boxW / 2, boxY + boxH/2 + 2);
            }

        } else {

        }
    }
}