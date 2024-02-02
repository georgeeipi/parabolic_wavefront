/*
parabolic_wavefront.js
23/01/2024
author George Galanis, Melbourne Australia

Copyright (c) 2024 George Galanis

This file is part of the Parabolic Wavefront software

The Wavefront software, HTML, CSS, JavaScript is free.
    You can redistribute it or modify it under the terms of the CNU License 3.0 of the License.
    This software is published without any Warranty or implied Warranty.
*/

const degToRad = Math.PI/180.0;
const radToDeg = 1/degToRad;


/****************************************************************
 *****************           Window Management      *************
 ****************************************************************/

window.onload=function(){
    init();
}

window.onresize=function(){
    init();
}

var scrollModeY; //store the scroll mode of the display while using mouse or touch functions.

function disableScroll(event) {
    scrollModeY=document.body.style.overflowY;//store the scroll mode of the display while using mouse or touch functions.
    document.body.style.overflowY="hidden"
    event.preventDefault();
}

function enableScroll(event) {
    document.body.style.overflowY=scrollModeY;
    event.returnValue=true;
}

const can=document.getElementById("parabolaCanvas");
const ctx = can.getContext("2d");


// mouse canvas routines

ctx.canvas.addEventListener('mousemove', mousemovedCtx);
ctx.canvas.addEventListener('mousedown', mousedownCtx);
ctx.canvas.addEventListener("mouseup", mouseupCtx);


// touch emulation routines, used when testing touch routines with a mouse
/*
ctx.canvas.addEventListener('mousemove', touchMovedMouseEmulationCtx);
ctx.canvas.addEventListener('mousedown', touchdownMouseEmulationCtx);
ctx.canvas.addEventListener("mouseup", touchEndMouseEmulationCtx);
*/
/*
can.addEventListener('touchmove', touchMovedCtx);
can.addEventListener('touchstart', touchStartCtx);
can.addEventListener('touchend', touchEndCtx);
*/

/*************************Common Drag Source functions **********/
function WorldVectorToCanvasVector(WorldVec){
    let CanvasPos = {x:0, y:0}
    var CanvasVec = new Vector2D(0,0);

    CanvasPos = wv.convertWorldToWin(WorldVec);
    CanvasVec.set(CanvasPos.x,CanvasPos.y);
    return CanvasVec;
}

function convertCanvasToWorldVector(CanvasVec){
    let WorldPos = {x:0, y:0};
    var WorldVec = new Vector2D(0,0);

    WorldPos = wv.convertWinToWorld(CanvasVec.x,CanvasVec.y);
    WorldVec.set(WorldPos.x,WorldPos.y);
    return WorldVec;
}

function CanvasDistance(CanvasVec,WorldVec){
    var WorldOnCanvasVec = new Vector2D(0,0);
    var DiffVec = new Vector2D(0,0);
    var DistOnCanvas = 0;

    WorldOnCanvasVec= WorldVectorToCanvasVector(WorldVec);
    DiffVec = CanvasVec.subtract(WorldOnCanvasVec);
    DistOnCanvas = DiffVec.magnitude();
    return DistOnCanvas;
}

function calculateWorldDistance(WorldVec1, WorldVec2){
    let dist = 0;

    var MS = new Vector2D(0.0, 0.0);
    let wv = new Vector2D(WorldVec1.x, WorldVec1.y);

    MS = wv.subtract(WorldVec2);
    dist = MS.magnitude();

    return dist;
}


function drawDishStructure(){
    // draw dish structure
    wv.setColor("#FF0000");
    wv.drawCircle(F, 0.019*parabolaD);   //draw focus point

    drawParabolaV(wv, parabolaA, parabolaD);
}

function drawSource(){
    //draw ray and source structure
    wv.setColor("#0000FF");
    wv.drawCircle(S,0.02*parabolaD);  //draw source point
}

function updateGrabbedSource(){
    ctx.clearRect(0,0,can.width,can.height); //clear Canvas
    updateRaysEmitSpreadSource();
    updateImagePlane();
    drawSource();
    drawDishStructure();
    drawFeedLocationDimensions();
}
/******************************************************************/



/********************** Mouse Drag Source functions ****************/
const sourceGrabSize=200;
var mouseGrabbedSource = false;

var BoundingRect =can.getBoundingClientRect();
function getMousePosCanvasVector(event){
    var mousePosCanvasVector = new Vector2D(0.0,0.0);
    BoundingRect = can.getBoundingClientRect(); //updated here in case window size changed

    let x = event.clientX - BoundingRect.left;  // mouse move simulation X
    let y = event.clientY - BoundingRect.top;   // y

    mousePosCanvasVector.set(x, y);
    return mousePosCanvasVector;
}


function mousedownCtx(event){
    var mousePosCanvasVector = new Vector2D(0,0);
    var mouseDistCanvas = 0;
    mousePosCanvasVector = getMousePosCanvasVector(event);
    mouseDistCanvas = CanvasDistance(mousePosCanvasVector,S);
    if (mouseDistCanvas<sourceGrabSize) {mouseGrabbedSource=true;}
    else (mouseGrabbedSource=false);
}

function mouseupCtx(event){
     mouseGrabbedSource=false;
}

function mousemovedCtx(event){
    var mousePosCanvasVector = new Vector2D(0,0);  //source position in Canvas Coords

   if (mouseGrabbedSource){
       mousePosCanvasVector = getMousePosCanvasVector(event);
       S=convertCanvasToWorldVector(mousePosCanvasVector);
       updateGrabbedSource();
   }
}

/*********************************************************/



/*******************Touch Emulation Drag Source functions****************/
let touchedScreen=false;
function touchdownMouseEmulationCtx(event){
    touchedScreen = true;
    touchStartCtx(event);
}

function touchMovedMouseEmulationCtx(event){
    if (touchedScreen){touchMovedCtx(event);}
}

function touchEndMouseEmulationCtx(event){
    touchedScreen=false;
    touchEndCtx(event);
}
/*************************************************************************/


/*******************Touch Drag Source functions***************************/

/*  for BoundingRect definition see mouse drag variables above */
function getTouchPosCanvasVector(event){
    var touchPosCanvasVector = new Vector2D(0.0,0.0);
    BoundingRect = can.getBoundingClientRect();

    let x = event.clientX - BoundingRect.left;  // mouse move simulation X
    let y = event.clientY - BoundingRect.top;   // y
    //  let x = event.targetTouches[0].pageX - BoundingRect.left;  //touch move x
    //  let y = event.targetTouches[0].pageY - BoundingRect.top;   //touch move y
    touchPosCanvasVector.set(x, y);
    return touchPosCanvasVector;
}

touchGrabbedSource=false;

function touchStartCtx(event){
    var touchPosCanvasVector = new Vector2D(0,0);
    var touchDistCanvas = 0;

    disableScroll(event);
    touchPosCanvasVector = getTouchPosCanvasVector(event);
    touchDistCanvas = CanvasDistance(touchPosCanvasVector,S);
    if (touchDistCanvas<sourceGrabSize) {touchGrabbedSource=true;};
}
function touchEndCtx(event){
    enableScroll(event);
    touchGrabbedSource=false;
}


function touchMovedCtx(event){
  if (touchGrabbedSource){
   let touchPosCanvasVector = getTouchPosCanvasVector(event);
   S=convertCanvasToWorldVector(touchPosCanvasVector);
   updateGrabbedSource();
   writeCanvasCoords(S.x, S.y);
 }
}
/*********************************************************************/



let touchMovedX=0; let touchMovedY =0;
function writeCanvasCoords(XwinTouch,YwinTouch){
    let xWin=200; let yWin=200;

    wv.setColor("#00ff00");

    touchMovedX = Math.round(XwinTouch);
    touchMovedY = Math.round(YwinTouch);

    let xwinStr = XwinTouch.toString();
    let ywinStr = YwinTouch.toString();
    let touchCoordStr = "Moved  " + xwinStr + "," + ywinStr + "  ";

    wv.writeTextWin(xWin,yWin+20, touchCoordStr);
}



/*******************************************************************************************/
/*****                     HTML Object management routines                       ***********/
/*******************************************************************************************/

var dimensionsButton = document.getElementById("dimensions");
var dimensions = false;
function drawFeedLocationDimensions(){
  var Diff = new Vector2D(0.0,0.0);

  //  calculateAngleAtFeed(a,xP, xS, yS)
  //  minIlluminationPointFloat
  let angleAtFeedMin = calculateAngleAtFeed(parabolaA, minIlluminationPointFloat,S.x, S.y);
  let angleAtFeedMax = calculateAngleAtFeed(parabolaA, maxIlluminationPointFloat, S.x, S.y);
  let angleAtFeed = angleAtFeedMax-angleAtFeedMin;

  Diff=S.subtract(F);
  if (dimensions) {
      wv.setColor("#00ff00");
      let xDim = Math.round(Diff.x);
      let yDim = Math.round(Diff.y);

      let angleAtFeedMin = calculateAngleAtFeed(parabolaA, minIlluminationPointFloat*parabolaD-parabolaD/2,S.x, S.y);
      let angleAtFeedMax = calculateAngleAtFeed(parabolaA, maxIlluminationPointFloat*parabolaD-parabolaD/2, S.x, S.y);
      let angleAtFeed = angleAtFeedMax-angleAtFeedMin;
      angleAtFeed=Math.round(angleAtFeed*radToDeg);
      let angleAtFeedStr = angleAtFeed.toString();

      let xDimStr = xDim.toString();
      let yDimStr = yDim.toString();
      let DimStr = "   " + xDimStr + "mm," + yDimStr + "mm"+" "+angleAtFeedStr+'⁰';
      wv.drawArrow(F, S);
      wv.writeTextWhiteBackWorld(S, DimStr);


      wv.writeTextWhiteBack

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

let intensityPlaneVertScaleFactor=10.0;  //scale for the display size on the plot to align with horizontal screen line
let intensityPlaneScale = intensityPlaneVertScaleFactor/(numWavelets);



function getNumWavelets(){
    numWaveletsValue.innerHTML=numWaveletsSlider.value;
    numWavelets=parseInt(numWaveletsValue.innerHTML);
    intensityPlaneScale = intensityPlaneVertScaleFactor/(numWavelets);
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


var numIntensityPointsSlider = document.getElementById("numIntensityPointsSlider");
var numIntensityPointsValue = document.getElementById("numIntensityPointsValue");
numIntensityPointsValue.innerHTML=numIntensityPointsSlider.value;
let numIntensityPoints=parseInt(numIntensityPointsValue.innerHTML);
function getNumIntensityPoints(){
    numIntensityPointsValue.innerHTML=numIntensityPointsSlider.value;
    numIntensityPoints=parseInt(numIntensityPointsValue.innerHTML);
    init();
    drawFeedLocationDimensions();
}


var subSamplingNumSlider = document.getElementById("subSamplingNumSlider");
var subSamplingNumValue = document.getElementById("subSamplingNumValue");
subSamplingNumValue.innerHTML=subSamplingNumSlider.value;
let subSamplingNum=parseInt(subSamplingNumValue.innerHTML);
function getSubSamplingNum(){
    subSamplingNumValue.innerHTML=subSamplingNumSlider.value;
    subSamplingNum=parseInt(subSamplingNumValue.innerHTML);
    init();
    drawFeedLocationDimensions();
}


const illuminationPointStepSize = 0.05;

var minIlluminationPointSlider = document.getElementById("minIlluminationPointSlider");
var minIlluminationPointValue = document.getElementById("minIlluminationPointValue");
minIlluminationPointValue.innerHTML=minIlluminationPointSlider.value;
let minIlluminationPointFloat=parseFloat(minIlluminationPointValue.innerHTML);
let minIlluminationPoint = minIlluminationPointFloat;
function getMinIlluminationPoint(){
    minIlluminationPointValue.innerHTML=minIlluminationPointSlider.value;
    minIlluminationPointFloat=parseFloat(minIlluminationPointValue.innerHTML);
    minIlluminationPoint = minIlluminationPointFloat;
    minIlluminationPoint = minIlluminationPoint.toFixed(2);
    if (minIlluminationPoint>=maxIlluminationPoint){
        minIlluminationPoint = maxIlluminationPoint-illuminationPointStepSize;
        minIlluminationPoint = minIlluminationPoint.toFixed(2);
        minIlluminationPointValue.innerHTML = minIlluminationPoint.toString(10);
        minIlluminationPointSlider.value = minIlluminationPointValue.innerHTML;
    }
    init();
    drawFeedLocationDimensions();
}

var maxIlluminationPointSlider = document.getElementById("maxIlluminationPointSlider");
var maxIlluminationPointValue = document.getElementById("maxIlluminationPointValue");
maxIlluminationPointValue.innerHTML=maxIlluminationPointSlider.value;
let maxIlluminationPointFloat=parseFloat(maxIlluminationPointValue.innerHTML);
let maxIlluminationPoint = maxIlluminationPointFloat;
function getMaxIlluminationPoint(){
    maxIlluminationPointValue.innerHTML=maxIlluminationPointSlider.value;
    maxIlluminationPoint=parseFloat(maxIlluminationPointValue.innerHTML);
    maxIlluminationPoint = maxIlluminationPoint.toFixed(2);
    if (maxIlluminationPoint<=minIlluminationPoint){
        maxIlluminationPointFloat = minIlluminationPointFloat+illuminationPointStepSize;
        maxIlluminationPoint = maxIlluminationPointFloat.toFixed(2);
        maxIlluminationPointValue.innerHTML = maxIlluminationPoint.toString(10);
        maxIlluminationPointSlider.value = maxIlluminationPointValue.innerHTML;
    }
    init();
    drawFeedLocationDimensions();
}

/****************************************************************
 ***********Function Related to Dish Geometry********************
 ****************************************************************/

function calculateParabola(a, x){
    return y=a*Math.pow(x, 2);
}

function calculateParabolaDx(a,x){
    return 2*a*x;
}

function calculateAngleAtFeed(a,xP, xS, yS){
    let yP=calculateParabola(a, xP);
    let xDiff=xP-xS;
    let yDiff = yS-yP;  //World Coords, yP os up from parabola surface
    return Math.atan2(xDiff,yDiff);
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
let lambda=parseFloat(lambdaValue.innerHTML)*1.22; //1.22 is the Fraunhof correction factor for circular apertures

var parabolaFDSlide = document.getElementById("fD");
var parabolaFDValue = document.getElementById("fDvalue");
parabolaFDValue.innerHTML=parabolaFDSlide.value;
let parabolaFD=parseFloat(parabolaFDSlide.value);

let parabolaF= parabolaFD*parabolaD;
let parabolaA= 1/(4*parabolaF);
let focus=1/(4*parabolaA);

let XworldMin=-(parabolaD/2)*1.2; let XworldMax=(parabolaD/2)*1.2;


let parabolaOffsetY=-parabolaD/5;
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
    parabolaOffsetY=-parabolaD/5;
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

const imagePlaneDistance = 10000000; //10kms in mm
const imagePlaneHeight = 120;


/**************************************************************************
**************   Number of sources for image-plane resolution    **********
***************************************************************************/

function convertThetaToWin(theta, wv){ //Theta referring to the range plotted  diffraction intensity graph
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


function drawImagePlane(wv){ //Image plane is the plane on which the diffraction intensity is plotted
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
    wv.writeTextWin(deg5Win-20, wv.y_win_min+imagePlaneHeight + 15,"5");

    deg10Win = convertThetaToWin(10.0*degToRad,wv);
    wv.writeTextWin(deg10Win-20, wv.y_win_min+imagePlaneHeight + 15,"10");

    deg15Win = convertThetaToWin(15.0*degToRad,wv);
    wv.writeTextWin(deg15Win-20, wv.y_win_min+imagePlaneHeight + 15,"15");

    deg20Win = convertThetaToWin(20.0*degToRad,wv);
    wv.writeTextWin(deg20Win-20, wv.y_win_min+imagePlaneHeight + 15,"20");  //subtract out x because text is left justified and is approax 20px.
}



var F = new Vector2D(0, focus);

var S = new Vector2D(0,parabolaF+0); //source vector; Starts at focus




function initDish(){
    wv.setColor("#FF0000");
    drawParabolaV(wv, parabolaA, parabolaD);
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


function updateRaysEmit(S){
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

/*
    const xMin = -1.0*parabolaD/2;
    const xMax = 1.0*parabolaD/2;

 */
    let xMin = minIlluminationPoint*parabolaD-parabolaD/2;
    let xMax = maxIlluminationPoint*parabolaD-parabolaD/2;
    let dx = (xMax-xMin)/numWavelets;

    for (rayNum = 0; rayNum <= numWavelets; rayNum=rayNum+1) {
        xWorld = rayNum*dx+xMin;

        Incident = calcParabolaIncident(xWorld);
        IncidentDirection = Incident.subtract(S);
        Normal = calcParabolaNormal(Incident);
        ReflectedDirecton = IncidentDirection.reflect(Normal);
        ReflectionUnit = ReflectedDirecton.unit();

        Ray0Emit = calcPhase0Point(Incident, IncidentDirection, ReflectionUnit);
        phase0Emits[rayNum] =Ray0Emit; //phase0 points used in intensity subsampling;

        // Draw some of the computer rays
        let notDraw = rayNum%rayIncrement;
        if (!notDraw){
            ReflectedRay = calcReflectedRays(IncidentDirection,ReflectionUnit);
            drawRays(Incident, Normal, IncidentDirection, ReflectedDirecton, Ray0Emit, ReflectedRay, S);
            wv.drawCircle(Ray0Emit,0.0075*parabolaD);  //draw phasezero points
        }
    }
    return phase0Emits;
}



function updateImagePlane(){ //The diffraction instensity graph
    var theta;
    var ImagePlaneRay = new Vector2D(0.0,0.0);
    var RI = new Vector2D(0.0,0.0); //reflection to image plane vector;
    var energycurr;
    var currPhase0Source = new Vector2D(0.0,0.0);
    var currPhase0Emits;

    var energy = [numIntensityPoints]; //for the square of intensity (power)



    drawImagePlane(wv);

    dTheta = (maxTheta - minTheta)/numIntensityPoints;

    let x_win_Range = parabolaD;

    for (let i=0; i<=numIntensityPoints; i++) { //for each point on the intensity plot
        theta = (minTheta + i*dTheta);
        ImagePlaneRay.set(imagePlaneDistance * Math.tan(theta), imagePlaneDistance);

        let sum = 0.0;

        for (let phase0SourceNum = 0; phase0SourceNum<= numberOfSources-1; phase0SourceNum++) { //for each phase0 wavelet from a particular source
            currPhase0Emits = phase0EmitsArray[phase0SourceNum];

            for (let Wi = 0; Wi <= numWavelets-1; Wi=Wi+1) {//for the ith wavelet, Wi, for the current source, currPhase0Emits
                currPhase0Source = currPhase0Emits[Wi];
                RI = ImagePlaneRay.subtract(currPhase0Source); //vector from phase 0 to current ImagePlane point;
                let dist = RI.magnitude();

                let nLambda = (dist % lambda); //get the phase in terms of a single wavelength
                let phase = 2.0 * Math.PI / lambda * nLambda; //lambda is wavelength
                let intcurr = Math.sin(phase);
                sum = intcurr + sum;
            }
        }

        energy[i]=sum*sum;


        let thetaWin = convertThetaToWin(theta,wv);

        let e_scale = intensityPlaneScale*intensityPlaneScale/(numberOfSources); //bug when adding up multiple sources

        energycurr = e_scale*energy[i];

        if (fill) { //draw all points
            wv.drawWinCircle(thetaWin, wv.y_win_min + imagePlaneHeight - energycurr, 1);  //draw filled power curve
        } else { // If statement selects the maximum value for the current source point.
            let maxEnergy=0.0;
            let ints = Math.round(subSamplingNum/2);
            for (j=i-ints; j<i+ints; j=j+1){
                if (j>=0){
                    if (energy[j]>maxEnergy){
                        maxEnergy=energy[j];
                    }
                }
            }
            wv.drawWinCircle(thetaWin, wv.y_win_min + imagePlaneHeight - e_scale*maxEnergy, 1);  //draw filled power curve
        }
    }
}



var phase0EmitsArray = [];

function updateRaysEmitSpreadSource(){
    const sourceSpread = 145.0;  //Septum feed is 145mm approx
    const minSourceX = -sourceSpread/2;
    const dSourceX = sourceSpread/(numberOfSources-1);

    var SourceCurr = new Vector2D(0.0,0.0);
    if (numberOfSources==1){// sourceSpread is underfined so setup as single source
        sourceNum = 0;
        SourceCurr.set(S.x,S.y);
        phase0EmitsArray[sourceNum] = updateRaysEmit(SourceCurr);
    }else {
        for (let sourceNum = 0; sourceNum <= numberOfSources - 1; sourceNum++) {
            let xSource = sourceNum * dSourceX + minSourceX;
            SourceCurr.set(xSource + S.x, S.y)

            phase0EmitsArray[sourceNum] = updateRaysEmit(SourceCurr);
        }
    }
}

window.innerHeight=2*window.innerWidth;

ParabolaWinWidth=window.innerWidth*0.8;
ParabolaWinHeight=ParabolaWinWidth;

can.width=ParabolaWinWidth;
can.height=ParabolaWinHeight;

var wv = new WorldView(ctx, XworldMin, XworldMax,YworldMin, YworldMax, 0, ParabolaWinWidth, 0, ParabolaWinHeight);


function init(){
    ParabolaWinWidth=window.innerWidth*0.8;
    ParabolaWinHeight=ParabolaWinWidth;

    can.width=ParabolaWinWidth;
    can.height=ParabolaWinHeight;

    wv = new WorldView(ctx, XworldMin, XworldMax,YworldMin, YworldMax, 0, ParabolaWinWidth, 0, ParabolaWinHeight);


    initDish();
    drawImagePlane(wv);
    updateRaysEmitSpreadSource();
    //draw ray and source structure

    drawSource();
    drawDishStructure();

    updateImagePlane();
}

/*****************************************************************************************/
/*
log power graph calculation for graph display
feed displacement display
 */
/*****************************************************************************************/
