/****************************************************************
 *****************           Window Management      *************
 ****************************************************************/

window.onload=function(){
    init();
}

window.onresize=function(){
    init();
}

const degToRad = Math.PI/180.0;

const parabolaCanvas = document.getElementById("parabolaCanvas");
const ctx = parabolaCanvas.getContext("2d");

ctx.canvas.addEventListener('mousemove', mousemovedCtx1);
ctx.canvas.addEventListener('mousedown', mousedownCtx1);
ctx.canvas.addEventListener("mouseup", mouseupCtx1);

var sourceHover=false;
var sourceGrabbed = false;


var dimensionsButton = document.getElementById("dimensions");
var dimensions = false;
function drawFeedLocationDimensions(){
  var Diff = new Vector2D(0.0,0.0);
  Diff=S.subtract(F);
  if (dimensions) {
      wv.setColor("#00ff00");
      let xDim = Math.round(Diff.x);
      let yDim = Math.round(Diff.y);
      let xDimStr = xDim.toString();
      let yDimStr = yDim.toString();
      let DimStr = "   " + xDimStr + "mm," + yDimStr + "mm";
      wv.drawArrow(F, S);
      wv.writeTextWhiteBackWorld(S, DimStr);
      wv.ctx.stroke();
  }  else {

  }
}

function toggleDimensions(){
    init();
    dimensions = !dimensions;
    if (dimensions){
        dimensionsButton.style.backgroundColor="#20ff20";
        drawFeedLocationDimensions();
    } else {
        dimensionsButton.style.backgroundColor="#F0F0EF";
        wv.ctx.stroke();
    }
}



var fillButton = document.getElementById("fill");
var fill = false;
function toggleFill(){
    fill = !fill;
    if (fill){
        fillButton.style.backgroundColor="#20ff20";
        init();
    } else {
        init();
        fillButton.style.backgroundColor="#F0F0EF";
        wv.ctx.stroke();
    }
    drawFeedLocationDimensions();
}

const numberOfSources = 1; //for symmetry number of feed sources must be odd
var numWaveletsSlider = document.getElementById("numWaveletsSlider");
var numWaveletsValue = document.getElementById("numWaveletsValue");
numWaveletsValue.innerHTML=numWaveletsSlider.value;
let numWavelets=parseInt(numWaveletsValue.innerHTML);
let nIntensities = numWavelets*1;
let intensityPlaneScale = 1.0/(numWavelets/100)*(numberOfSources);
var intensity = [nIntensities];
function getNumWavelets(){
    numWaveletsValue.innerHTML=numWaveletsSlider.value;
    numWavelets=parseInt(numWaveletsValue.innerHTML);
    nIntensities = numWavelets*1;
    intensityPlaneScale = 1.0/(numWavelets/100)*(numberOfSources);
    intensity = [nIntensities];
    init();
    drawFeedLocationDimensions();
}


var spanSlider = document.getElementById("spanSlider");
var spanValue = document.getElementById("spanValue");
spanValue.innerHTML=spanSlider.value;
let spanDeg=parseInt(spanValue.innerHTML);
let minTheta = -spanDeg*degToRad;
let maxTheta = spanDeg*degToRad;
function getIntensitySpan(){
    spanValue.innerHTML=spanSlider.value;
    spanDeg=parseInt(spanValue.innerHTML);
    minTheta = -spanDeg*degToRad;
    maxTheta = spanDeg*degToRad;
    init();
    drawFeedLocationDimensions();
}


const sourceGrabSize=80;
function mousemovedCtx1(event){
    var Xwin; var Ywin;
    var Mworld = {x:0.0, y:0.0};
    var Mw = new Vector2D(0.0);
    var MS = new Vector2D(0,0);
    var Fdist;


    Xwin = event.clientX - ctx.canvas.offsetLeft;
    Ywin = event.clientY - ctx.canvas.offsetTop;

    Mworld = wv.convertWinToWorld(Xwin,Ywin);
    Mw.set(Mworld.x,Mworld.y);

    MS = Mw.subtract(S);

    Fdist = MS.magnitude();
    if (Fdist<sourceGrabSize*parabolaD/(3000)){sourceHover = true}
    else {sourceHover=false};



    if (sourceGrabbed){
        S.set(Mworld.x,Mworld.y);
        ctx.clearRect(0,0,parabolaCanvas.width, parabolaCanvas.height);

        updateRaysEmitSpreadSource();
        updateImagePlane();
        drawFeedLocationDimensions();
    }
}


function mousedownCtx1(event){

    if (sourceHover){
        sourceGrabbed = true
    }
}

function mouseupCtx1(event){
    sourceGrabbed = false;
}
/****************************************************************
 ****************************************************************
 ****************************************************************/

function calculateParabola(a, x){
    return y=a*Math.pow(x, 2);
}

function calculateParabolaDx(a,x){
    return 2*a*x;
}


function drawParabolaV(vw, a, D){
    let parabola_x_min = -D/2; let parabola_x_max = D/2;
    let currPointWorld = {x:parabola_x_min, y:calculateParabola(a, parabola_x_min)};

    var Pwin = {x:0.0, y:0.0};

    Pwin = vw.convertWorldToWin(currPointWorld);

    vw.ctx.beginPath();
    vw.ctx.moveTo(Pwin.x, Pwin.y);

    for (let x = parabola_x_min; x<=parabola_x_max; x++){
        currPointWorld.x =x;
        currPointWorld.y = calculateParabola(a, currPointWorld.x);
        Pwin = vw.convertWorldToWin(currPointWorld);
        vw.ctx.lineTo(Pwin.x,Pwin.y);
    }
    vw.ctx.stroke();
}




/*****************************************************************************
**********    Parabolic Dish, WorldWindow  Geometry **************************
******************************************************************************/

var parabolaDSlide = document.getElementById("diameter");
var parabolaDValue = document.getElementById("diameterValue");
parabolaDValue.innerHTML=parabolaDSlide.value+"mm";
let parabolaD=parseInt(parabolaDValue.innerHTML);

var lambdaSlide = document.getElementById("wavelength");
var lambdaValue = document.getElementById("wavelengthValue");
lambdaValue.innerHTML=lambdaSlide.value+"mm";
let lambda=parseFloat(lambdaValue.innerHTML)*1.22; //1.22

var parabolaFDSlide = document.getElementById("fD");
var parabolaFDValue = document.getElementById("fDvalue");
parabolaFDValue.innerHTML=parabolaFDSlide.value;
let parabolaFD=parseFloat(parabolaFDSlide.value);

let parabolaF= parabolaFD*parabolaD;
let parabolaA= 1/(4*parabolaF);
let focus=1/(4*parabolaA);

let XworldMin=-(parabolaD/2)*1.2; let XworldMax=(parabolaD/2)*1.2;
// let YworldMin=-50; let YworldMax=XworldMax*2+YworldMin;
let parabolaOffsetY=-parabolaD/60;
let YworldMin=parabolaOffsetY; YworldMax=XworldMax*2+YworldMin;


//const rayLength = 2750; //ray length in the world view in mm
let rayLength = parabolaD/2;

let rayPathLengthDish = parabolaF + parabolaD*parabolaD/(16 * parabolaF);
let rayPathLength = parabolaF + parabolaD*parabolaD/(16 * parabolaF) +rayLength;


function getParabolaDiameter(){
    parabolaDValue.innerHTML = parabolaDSlide.value+"mm";
    parabolaD=parseInt(parabolaDSlide.value);
    parabolaF= parabolaFD*parabolaD;
    parabolaA= 1/(4*parabolaF);
    focus=1/(4*parabolaA);

    XworldMin=-(parabolaD/2)*1.2; XworldMax=(parabolaD/2)*1.2;
    parabolaOffsetY=-parabolaD/60;
    YworldMin=parabolaOffsetY; YworldMax=XworldMax*2+YworldMin;

    F = new Vector2D(0, focus);

    S = new Vector2D(0,parabolaF+0); //source vector; Starts at focus

    rayLength = parabolaD/2;

    rayPathLengthDish = parabolaF + parabolaD*parabolaD/(16 * parabolaF);
    rayPathLength = parabolaF + parabolaD*parabolaD/(16 * parabolaF) +rayLength;

   init();
   drawFeedLocationDimensions();
};


function getWavelength(){
    lambdaSlide = document.getElementById("wavelength");
    lambdaValue = document.getElementById("wavelengthValue");
    lambdaValue.innerHTML=lambdaSlide.value + "mm";
    lambda=parseFloat(lambdaValue.innerHTML)*1.22;  //1.22 is Fraunhofer correction for spherical aperture

    init();
    drawFeedLocationDimensions();
};


function getFD(){
    parabolaFDValue.innerHTML = parabolaFDSlide.value;
    parabolaFD=parseFloat(parabolaFDSlide.value);
    parabolaF= parabolaFD*parabolaD;
    parabolaA= 1/(4*parabolaF);
    focus=1/(4*parabolaA);

    XworldMin=-(parabolaD/2)*1.2; XworldMax=(parabolaD/2)*1.2;
    parabolaOffsetY=-parabolaD/60;
    YworldMin=parabolaOffsetY; YworldMax=XworldMax*2+YworldMin;

    F = new Vector2D(0, focus);

    S = new Vector2D(0,parabolaF+0); //source vector; Starts at focus

    //const rayLength = 2750; //ray length in the world view in mm
    rayLength = parabolaD/2;

    rayPathLengthDish = parabolaF + parabolaD*parabolaD/(16 * parabolaF);
    rayPathLength = parabolaF + parabolaD*parabolaD/(16 * parabolaF) +rayLength;

    init();
    drawFeedLocationDimensions();
};


/********************************************************************************
 ******        Plotting Parameters                                   ************
 *******************************************************************************/
//const lambda = 230;
const intSource = 1.0;

/*
const minTheta = -20.0*degToRad;
const maxTheta =  20.0*degToRad;
 */


const imagePlaneDistance = 10000000; //10kms in mm
const imagePlaneHeight = 120;


/**************************************************************************
**************   Number of sources for image-plane resolution    **********
***************************************************************************/

//const nEmits = 900;   // number of wavelets  default 300
//const nIntensities = nEmits*4; //number of image plane points default 900


//const intensityPlaneScale = 1.0/(nEmits/100)*(numberOfSources);

function convertThetaToWin(theta, wv){
    let thetaRange = maxTheta-minTheta;
    let winXRange = wv.x_win_max-wv.x_win_min;
    let xWinCentre = (wv.x_win_min + wv.x_win_max)/2;

    let fracThetaRange = (theta-minTheta)/thetaRange;
    let fracWinXRange = fracThetaRange;

    let xWin = wv.x_win_min+fracWinXRange*winXRange;
    let xIntWin = Math.round(xWin);

    xIntWin = xIntWin+xWinCentre-winXRange/2;
    return xIntWin;
}


function drawImagePlane(wv){
  var nInt;
    var degMinus20Win; var degMinus15Win;  var degMinus10Win;  var degMinus5Win;
    var deg0Win;
    var deg5Win;   var deg10Win;  var deg15Win;  var deg20Win;
/*
    //test code for checking aspect ratio is 1:1
    wv.setColor("#00FF00");
    let winOffset=10 ;
    wv.drawWinLine({x:wv.x_win_min + winOffset,y:wv.y_win_min + winOffset}, {x:wv.x_win_max - winOffset, y:wv.y_win_min + winOffset});
    wv.drawWinLine({x:wv.x_win_max-winOffset, y:wv.y_win_min+winOffset},{x:wv.x_win_max-winOffset, y:wv.y_win_max-winOffset});
    wv.drawWinLine({x:wv.x_win_max - winOffset,y:wv.y_win_max - winOffset}, {x:wv.x_win_min + winOffset, y:wv.y_win_max - winOffset});
    wv.drawWinLine({x:wv.x_win_min + winOffset,y:wv.y_win_max - winOffset}, {x:wv.x_win_min + winOffset, y:wv.y_win_min + winOffset});

    wv.setColor("#FFDD00");
    let worldOffset = 10;
    wv.drawLine({x:wv.x_world_min+worldOffset,y:wv.y_world_min+worldOffset},{x:wv.x_world_max-worldOffset,y:wv.y_world_min+worldOffset});
    wv.drawLine({x:wv.x_world_min+worldOffset,y:wv.y_world_min+worldOffset},{x:wv.x_world_min+worldOffset,y:wv.y_world_max-worldOffset});
    wv.drawLine({x:wv.x_world_min+worldOffset,y:wv.y_world_max-worldOffset},{x:wv.x_world_max-worldOffset,y:wv.y_world_max-worldOffset});
    wv.drawLine({x:wv.x_world_max-worldOffset,y:wv.y_world_max-worldOffset},{x:wv.x_world_max-worldOffset,y:wv.y_world_min+worldOffset});
*/

    wv.setColor("#555555");

    wv.drawWinDashLine({x:wv.x_win_min, y:wv.y_win_min+imagePlaneHeight-100},{x:wv.x_win_max, y:wv.y_win_min + imagePlaneHeight-100}) ; //unit intensity line
    wv.drawWinLine({x:wv.x_win_min, y:wv.y_win_min+imagePlaneHeight},{x:wv.x_win_max, y:wv.y_win_min + imagePlaneHeight}) ; //zero intensity line

    degMinus20Win = convertThetaToWin(-20.0*degToRad,wv);
    wv.writeTextWin(degMinus20Win, wv.y_win_min+imagePlaneHeight + 15,"-20");

    degMinus15Win = convertThetaToWin(-15.0*degToRad,wv);
    wv.writeTextWin(degMinus15Win, wv.y_win_min+imagePlaneHeight + 15,"-15");

    degMinus10Win = convertThetaToWin(-10.0*degToRad,wv);
    wv.writeTextWin(degMinus10Win, wv.y_win_min+imagePlaneHeight + 15,"-10");

    degMinus5Win = convertThetaToWin(-5.0*degToRad,wv);
    wv.writeTextWin(degMinus5Win, wv.y_win_min+imagePlaneHeight + 15,"-5");

    deg0Win = convertThetaToWin(0*degToRad,wv);
    wv.writeTextWin(deg0Win, wv.y_win_min+imagePlaneHeight + 15,"0");

    deg5Win = convertThetaToWin(5.0*degToRad,wv);
    wv.writeTextWin(deg5Win, wv.y_win_min+imagePlaneHeight + 15,"5");

    deg10Win = convertThetaToWin(10.0*degToRad,wv);
    wv.writeTextWin(deg10Win, wv.y_win_min+imagePlaneHeight + 15,"10");

    deg15Win = convertThetaToWin(15.0*degToRad,wv);
    wv.writeTextWin(deg15Win, wv.y_win_min+imagePlaneHeight + 15,"15");

    deg20Win = convertThetaToWin(20.0*degToRad,wv);
    wv.writeTextWin(deg20Win-20, wv.y_win_min+imagePlaneHeight + 15,"20");  //subtract out x because text is left justified and is approax 20px.
}



var F = new Vector2D(0, focus);

var S = new Vector2D(0,parabolaF+0); //source vector; Starts at focus

//var intensity = [nIntensities];


function initDish(){
    wv.setColor("#FF0000");
//    wv.drawCircle(S,40);
    drawParabolaV(wv, parabolaA, parabolaD);
/*
    for (let n = 0; n<= nEmits; n++){
        phase0Emits[n] = new Vector2D(0.0,0.0);
    }

 */
}

function calcParabolaIncident(xWorld){
    var Incident = new Vector2D(0.0,0.0);

    let Iy = calculateParabola(parabolaA,xWorld);
    Incident.set(xWorld,Iy);
    return Incident;

}

function calcParabolaNormal(ParabolaPoint){
    var G = new Vector2D(0.0,0.0);
    var N= new Vector2D(0.0,0.0);

    let m = calculateParabolaDx(parabolaA, ParabolaPoint.x);
    G.initGrad(m, 1);
    N = G.normal();
    return N;
}


function calcReflectedRays(D,Ru){
    var Rs = new Vector2D(0.0,0.0);
    var Dmag;
    Dmag = D.magnitude();
    Rs = Ru.scale(rayPathLength - Dmag);
    return Rs;
}

function calcPhase0Point(P, D,R){
    var Ray0Emit = new Vector2D(0.0,0.0);
    var Dmag;

    Dmag = D.magnitude();

    Ray0Emit = R.scale(rayPathLengthDish - Dmag);
    Ray0Emit = Ray0Emit.add(P);
    return Ray0Emit;
};

function drawRays(P, N, D, R, Ray0Emit, Rs, Source){
        wv.setColor("#0000FF");
        wv.drawArrow(Source, P);
        wv.drawPDirArrow(P, Rs);
 }


function updateRaysEmitv2(S){
    const rayIncrement = 30;

    var rayNum = 0;
    var Incident = Vector2D(0.0,0.0);
    var Normal = Vector2D(0.0,0.0);
    var IncidentDirection = Vector2D(0.0,0.0);
    var ReflectedDirecton = Vector2D(0.0,0.0);
    var ReflectionUnit   = Vector2D(0.0,0.0);
    var ReflectedRay = Vector2D(0.0,0.0);
    var Ray0Emit = Vector2D(0.0,0.0);
    var xWorld;
    var phase0Emits = [numWavelets]; //location of 0 phase

    for (rayNum = 0; rayNum <= numWavelets; rayNum=rayNum+1) {
        xWorld = rayNum*parabolaD/numWavelets-parabolaD/2;


        Incident = calcParabolaIncident(xWorld);
        IncidentDirection = Incident.subtract(S);
        Normal = calcParabolaNormal(Incident);
        ReflectedDirecton = IncidentDirection.reflect(Normal);
        ReflectionUnit = ReflectedDirecton.unit();

        Ray0Emit = calcPhase0Point(Incident, IncidentDirection, ReflectionUnit);
        phase0Emits[rayNum] =Ray0Emit; //phase0 points used in intensity subsampling;

        let notDraw = rayNum%rayIncrement;
        if (!notDraw){
            ReflectedRay = calcReflectedRays(IncidentDirection,ReflectionUnit);
            drawRays(Incident, Normal, IncidentDirection, ReflectedDirecton, Ray0Emit, ReflectedRay, S);
            wv.drawCircle(Ray0Emit,0.0075*parabolaD);  //draw phasezero points
        }else{
            let dummy=0;
            dummy = dummy+1;
        };
    }


    //draw ray and source structure
    wv.setColor("#0000FF");
    wv.drawCircle(S,0.02*parabolaD);  //draw source point

    // draw dish structure
    wv.setColor("#FF0000");
    wv.drawCircle(F, 0.019*parabolaD);   //draw focus point
    drawParabolaV(wv, parabolaA, parabolaD);

    return phase0Emits;
}


var prevInts = 0;
var maxEnergyInts = 0.0;


function updateImagePlane(){
    var sum;
    var theta;
    var ImagePlaneRay = new Vector2D(0.0,0.0);
    var RI = new Vector2D(0.0,0.0); //reflection to image plane vector;
    var dist;
    var intcurr;
    var energycurr;
    var dIntLine;
    var currPhase0Source = new Vector2D(0.0,0.0);
    var currPhase0Emits;


    let e_scale = 1/numWavelets*intensityPlaneScale/Math.pow(numberOfSources,2);

    drawImagePlane(wv);

    dTheta = (maxTheta - minTheta)/nIntensities;

    let x_win_Range = parabolaD;
    dIntLine = x_win_Range/nIntensities;

    const ints = 10;

    for (let i=0; i<=nIntensities; i++) { //for each point on the intensity plot
        theta = (minTheta + i*dTheta);
        ImagePlaneRay.set(imagePlaneDistance * Math.tan(theta), imagePlaneDistance);

        sum = 0.0;

        for (let phase0SourceNum = 0; phase0SourceNum<= numberOfSources-1; phase0SourceNum++) { //for each phase0 emmision from a particular source
            currPhase0Emits = phase0EmitsArray[phase0SourceNum];

            for (let e = 0; e <= numWavelets-1; e=e+1) {//for each reflection point from that source
                currPhase0Source = currPhase0Emits[e];
                RI = ImagePlaneRay.subtract(currPhase0Source); //vector from phase 0 to current ImagePlane point;
                dist = RI.magnitude();

                let nLambda = (dist % lambda);
                let phase = 2.0 * Math.PI / lambda * nLambda; //lambda is wavelength
                intcurr = intSource * Math.sin(phase);
                sum = intcurr + sum;
            }
        }


        intensity[i] = sum;
        currIntPoint = -parabolaD/2+i*dIntLine;

        let thetaWin = convertThetaToWin(theta,wv);

        let thetaWinInts = Math.trunc(thetaWin/ints);

        energycurr = e_scale*sum*sum;

        if (prevInts==thetaWinInts){ // If statement selects the maximum value for the current source point.
            if(energycurr>maxEnergyInts){maxEnergyInts = energycurr};
        } else {
            //wv.drawWinCircle(thetaWinInts+iOffs, wv.y_win_min+imagePlaneHeight-maxEnergyInts,1);
            //           wv.drawWinCircle(thetaWinInts, wv.y_win_min+imagePlaneHeight-maxEnergyInts,1);
            wv.drawWinCircle(thetaWin,    wv.y_win_min+imagePlaneHeight-maxEnergyInts,numberOfSources);  //draw intensity power curve
            prevInts=thetaWinInts;
            maxEnergyInts = 0.0;
        }
        /*****************************************************************************/
        //   wv.drawWinCircle(thetaWin,    wv.y_win_min+imagePlaneHeight-energycurr,numberOfSources);  //draw filled power curve
        /*****************************************************************************/
        if (fill) {
            wv.drawWinCircle(thetaWin, wv.y_win_min + imagePlaneHeight - energycurr, numberOfSources);  //draw filled power curve
        }
    }
}


var phase0EmitsArray = [];

function updateRaysEmitSpreadSource(){
    const sourceSpread = 250.0;  //Septum feed is 145mm approx
    const minSourceX = -sourceSpread/2;
    const dSourceX = sourceSpread/(numberOfSources-1);

    var SourceCurr = new Vector2D(0.0,0.0);
    if (numberOfSources==1){// sourceSpread is underfined so setup as single source
        sourceNum = 0;
        SourceCurr.set(S.x,S.y);
        phase0EmitsArray[sourceNum] = updateRaysEmitv2(SourceCurr);
    }else {
        for (let sourceNum = 0; sourceNum <= numberOfSources - 1; sourceNum++) {
            let xSource = sourceNum * dSourceX + minSourceX;
            SourceCurr.set(xSource + S.x, S.y)

            phase0EmitsArray[sourceNum] = updateRaysEmitv2(SourceCurr);
        }
    }
}

// window.open("","","width=400, height=800");
//window.innerWidth=700;
window.innerHeight=2*window.innerWidth;

ParabolaWinWidth=window.innerWidth*0.8;
ParabolaWinHeight=ParabolaWinWidth;

parabolaCanvas.width=ParabolaWinWidth;
parabolaCanvas.height=ParabolaWinHeight;

var wv = new WorldView(ctx, XworldMin, XworldMax,YworldMin, YworldMax, 0, ParabolaWinWidth, 0, ParabolaWinHeight);


function init(){
    ParabolaWinWidth=window.innerWidth*0.8;
    ParabolaWinHeight=ParabolaWinWidth;

    parabolaCanvas.width=ParabolaWinWidth;
    parabolaCanvas.height=ParabolaWinHeight;

    wv = new WorldView(ctx, XworldMin, XworldMax,YworldMin, YworldMax, 0, ParabolaWinWidth, 0, ParabolaWinHeight);


    initDish();
    drawImagePlane(wv);

    updateRaysEmitSpreadSource();
    updateImagePlane();
}

/*****************************************************************************************/
/*
To Do
f/D slider
frequency/wavelength vs Diameter parameters for intensity/power graph calculations
fraunhofer correction
number of points option
filled display option
log power graph calculation for graph display
feed displacement display

 */
/*****************************************************************************************/
