

function drawArrow(ctx, fromx, fromy, tox, toy, arrowWidth, color){
    //variables to be used when creating the arrow
    var headlen = 10;
    var angle = Math.atan2(toy-fromy,tox-fromx);

    ctx.save();
    ctx.strokeStyle = color;

    //starting path of the arrow from the start square to the end square
    //and drawing the stroke
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.lineWidth = arrowWidth;
    ctx.stroke();

    //starting a new path from the head of the arrow to one of the sides of
    //the point
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),
        toy-headlen*Math.sin(angle-Math.PI/7));

    //path from the side point of the arrow, to the other side point
    ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),
        toy-headlen*Math.sin(angle+Math.PI/7));

    //path from the side point back to the tip of the arrow, and then
    //again to the opposite side point
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),
        toy-headlen*Math.sin(angle-Math.PI/7));

    //draws the paths created above
    ctx.stroke();
    ctx.restore();
}

function drawXsubY(ctx, fontSize, x, y, Xtext,Ytext){
    var x_offs; var y_offs;
    let subsize=fontSize*0.8;

    if (Xtext.toUpperCase()==Xtext) {
        if (Xtext=="S"){x_offs=subsize*0.8}
    else{x_offs= subsize*1.05;}
    } else {x_offs=subsize*0.6;}

    y_offs=subsize * 0.3;

    let ctxfont=ctx.font;

    ctx.font="italic "+fontSize.toString()+"px Arial";
    ctx.fillText( Xtext, x, y);
    ctx.font = "italic "+subsize.toString() + "px Arial";
    ctx.fillText(Ytext, x + x_offs, y + y_offs);

    ctx.font=ctxfont;
}


function calcScaleWorldToWin(worldMin, worldMax, winMin,winMax){
    let worldRange = worldMax - worldMin;
    let winRange = winMax - winMin;
    var scale;
//    scale= (winMax-winMin)/(worldMax-worldMin);
    scale = winRange/worldRange;
    return scale;
}

function convertWorldtoWin(worldCoord, worldToWinScale,worldMin){
    return worldToWinScale*(worldCoord-worldMin);
}


/******************************************************************************/
/**********                  World View Object                       **********/
/******************************************************************************/

function WorldView(CanvasContext,
                   x_world_min, x_world_max, y_world_min, y_world_max,
                   x_win_min, x_win_max, y_win_min, y_win_max){

    this.ctx = CanvasContext;
    this.x_world_min = x_world_min;
    this.x_world_max = x_world_max;
    this.y_world_min = y_world_min;
    this.y_world_max = y_world_max;

    this.x_win_max = x_win_max;
    this.x_win_min =  x_win_min;
    this.y_win_min = y_win_min;
    this.y_win_max = y_win_max;

    this.scaleX_WorldToWin = calcScaleWorldToWin(x_world_min, x_world_max, x_win_min, x_win_max);
    this.scaleY_WorldToWin = calcScaleWorldToWin(y_world_min, y_world_max, y_win_max, y_win_min);


    this.updateWin = function(x_win_min, x_win_max, y_win_min, y_win_max){
        this.x_win_min = x_win_min;
        this.x_win_max = x_win_max;
        this.y_win_min = y_win_min;
        this.y_win_max = y_win_max;

        this.scaleX_WorldToWin = calcScaleWorldToWin(x_world_min, x_world_max, x_win_min, x_win_max);
        this.scaleY_WorldToWin = calcScaleWorldToWin(y_world_min, y_world_max, y_win_max, y_win_min);
    }


    this.convertWinToWorld = function (Xwin,Ywin){
        var Vworld = {x:0.0, y:0.0};

        Vworld.x = Xwin/this.scaleX_WorldToWin + this.x_world_min;
        Vworld.y = Ywin/this.scaleY_WorldToWin + this.y_world_max;
        return Vworld;

    }

    this.convertWorldToWin = function(Vworld){
        var Vwin = {x:0.0, y:0.0};
        Vwin.x = this.scaleX_WorldToWin*(Vworld.x - this.x_world_min);
        Vwin.y = this.scaleY_WorldToWin*(Vworld.y - this.y_world_max);
        return Vwin;
    }

    this.drawLine = function (WorldStart,WorldEnd){
        var WinStart={x:0.0,y:0.0}; var WinEnd={x:0.0,y:0.0};
        WinStart=this.convertWorldToWin(WorldStart);
        WinEnd=this.convertWorldToWin(WorldEnd);

        this.ctx.beginPath();
        this.ctx.moveTo(WinStart.x,WinStart.y);
        this.ctx.lineTo(WinEnd.x, WinEnd.y);
        this.ctx.stroke();
    }

    this.setColor = function(color){
        this.ctx.strokeStyle = color;
    }

    this.drawPDir = function(WorldStart, Direction){
        var WinStart = {x:0.0, y:0.0}; var WinDir = {x:0.0, y:0.0}; var WinEnd={x:0.0,y:0.0};
        WinStart = this.convertWorldToWin(WorldStart);
        WinDir.x = Direction.x * this.scaleX_WorldToWin;
        WinDir.y = Direction.y * this.scaleY_WorldToWin;

        WinEnd.x  = WinStart.x+WinDir.x;
        WinEnd.y  = WinStart.y+WinDir.y;

        this.ctx.beginPath();
        this.ctx.moveTo(WinStart.x, WinStart.y);
        this.ctx.lineTo(WinEnd.x, WinEnd.y);
        this.ctx.stroke();
    }

    this.drawCentreDir = function (WorldStart, Direction, magnitude){
        var  Dir = new Vector2D(Direction.x,Direction.y);
        var oppDir = new Vector2D(0.0,0.0);

        var halfMag = magnitude/2;

        Dir = Dir.scale(halfMag);
        oppDir = Direction.scale(-halfMag);
        this.drawPDir(WorldStart, Dir);
        this.drawPDir(WorldStart, oppDir);
    }


    this.drawArrow = function (WorldStart,WorldEnd){
        var WinStart={x:0.0,y:0.0}; var WinEnd={x:0.0,y:0.0};
        WinStart=this.convertWorldToWin(WorldStart);
        WinEnd=this.convertWorldToWin(WorldEnd);

        drawArrow(this.ctx, WinStart.x, WinStart.y, WinEnd.x, WinEnd.y, 1, "#0000FF");
    }

    this.drawPDirArrow = function(WorldStart, Direction) {
        var WinStart = {x: 0.0, y: 0.0};
        var WinDir = {x: 0.0, y: 0.0};
        var WinEnd = {x: 0.0, y: 0.0};
        WinStart = this.convertWorldToWin(WorldStart);
        WinDir.x = Direction.x * this.scaleX_WorldToWin;
        WinDir.y = Direction.y * this.scaleY_WorldToWin;

        WinEnd.x = WinStart.x + WinDir.x;
        WinEnd.y = WinStart.y + WinDir.y;

        drawArrow(this.ctx, WinStart.x, WinStart.y, WinEnd.x, WinEnd.y, 1, "#0000FF");
    }

    this.drawCircle = function (CentreV, Radius){
        var WinCentre = {x:0.0, y:0.0};
        var WinRadius;

        WinCentre = this.convertWorldToWin(CentreV);
        WinRadius = Radius * this.scaleX_WorldToWin;

        this.ctx.beginPath();
        this.ctx.arc(WinCentre.x,WinCentre.y,WinRadius, 0, 2*Math.PI);
        this.ctx.stroke();
    }

    this.drawWinLine = function(Start, End){
        this.ctx.setLineDash([]);
        this.ctx.beginPath();
        this.ctx.moveTo(Start.x,Start.y);
        this.ctx.lineTo(End.x,End.y);
        this.ctx.stroke();
    }

    this.drawWinDashLine = function(Start, End){
        this.ctx.setLineDash([3,5]);
        this.ctx.beginPath();
        this.ctx.moveTo(Start.x,Start.y);
        this.ctx.lineTo(End.x,End.y);
        this.ctx.stroke();
    }

    this.drawWinCircle = function(x,y,radius){
        this.ctx.beginPath();
        this.ctx.arc(x,y,radius,0, 2.0*Math.PI);
        this.ctx.stroke();
    }

    this.writeTextWin = function(xWin,yWin, Text){
        this.ctx.font = "16px Arial";
        this.ctx.color="#000000";
        this.ctx.fillText(Text,xWin,yWin);
    }

    this.writeTextWorld = function(World, Text){
        let Win=this.convertWorldToWin(World);
        this.writeTextWin(Win.x,Win.y,Text);
    }

    this.writeTextWhiteBackWorld = function(World, Text){
        let Win=this.convertWorldToWin(World);
        this.ctx.fillStyle="#ffffff";
        this.ctx.fillRect(Win.x+0,Win.y-15, 100, 20);
        this.ctx.stroke();
        this.ctx.fillStyle="#000000";
        this.writeTextWin(Win.x,Win.y,Text);
    }

    this.ctx.strokeStyle="#00BB00";
}
/******************************************************************************/


/******************************************************************************/
/**********                   Vector2D  Object                       **********/
/******************************************************************************/

function Vector2D(x,y){
    this.x=x;
    this.y=y;

    this.set = function(x,y){
        this.x = x;
        this.y = y;
    }

    this.initGrad = function(m,mag){
        atanM = Math.atan(m);
        this.x = Math.cos(atanM);
        this.y = Math.sin(atanM);
        this.x = this.x * mag;
        this.y = this.y * mag;
    }


    this.magnitude = function(){
        return Math.sqrt(this.x*this.x+this.y*this.y);
    }

    this.unit = function(){
        var U = new Vector2D(0.0,0.0);
        let mag = Math.sqrt(this.x*this.x+this.y*this.y);
        U.x = this.x/mag;
        U.y = this.y/mag;
        return U;
    }

    this.normal = function(){
        var N = new Vector2D(-this.y, this.x);

        return N;
    }


    this.innerProduct = function(V){
        return this.x*V.x + this.y*V.y;
    }

    this.scale = function(s){
        sV = new Vector2D(0.0, 0.0);
        sV.x = s*this.x;
        sV.y = s*this.y;

        return sV;
    }

    this.add = function(V){
        aV = new Vector2D(0.0,0.0);
        aV.x = this.x+V.x;
        aV.y = this.y+V.y;

        return aV;
    }

    this.subtract = function(V){
        var diff = new Vector2D(0.0,0.0);

        diff.x = this.x-V.x;
        diff.y = this.y-V.y;

        return diff;
    }

    this.reflect = function(N){
        //    R=D-2(D.N)N
        var dotP;
        var sN= new Vector2D(N.x,N.y);
        var R= new Vector2D(0.0, 0.0);

        dotP = this.innerProduct(N);

        sN = N.scale(-2*dotP);

        R = this.add(sN);
        return R;
    }
}
/******************************************************************************/

