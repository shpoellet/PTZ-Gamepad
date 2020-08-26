require("../js/gamecontroller.js");
// https://www.npmjs.com/package/gamecontroller.js

var zeroThreshold = 0.04;

var a = 1/(1-zeroThreshold);
var b = 1 - a;

console.log(a +" " + b)

var AxeCallback;
var ButtonCallback;

var lastAxeValues =[[0,0],[0,0]]


function MapAxeValue(value){
  let mapped = (a * Math.abs(value)) + b;
  console.log(mapped);
  mapped = value > 0 ? mapped : 0 - mapped;
  return mapped;
}


function GP_Axes(index, axeValues){
  let x = Math.abs(axeValues[0]) > zeroThreshold ? MapAxeValue(axeValues[0]) :0;
  let y = Math.abs(axeValues[1]) > zeroThreshold ? MapAxeValue(axeValues[1]) :0;

  if( (x != lastAxeValues[index][0]) || (y != lastAxeValues[index][1]) ){
    AxeCallback(index, [x, y])
    lastAxeValues[index]=[x, y];
    // console.log("joystick "+index + " : " + lastAxeValues[index]);
  }

}

gameControl
  .on('connect', function(gp){
    for (let i = 0; i < Math.min(17, gp.buttons); i++) {
      gp.before('button' + i, function(){
        // console.log("button pressed "+i);
        ButtonCallback(i, true);
      });
      gp.after('button' + i, function(){
        // console.log("button released "+i);
        ButtonCallback(i, false);
      });
    }

  })
  .on('afterCycle', function(){
    GP_Axes(0, gameControl.getGamepad(0).axeValues[0]);
    GP_Axes(1, gameControl.getGamepad(0).axeValues[1]);
  })
  .on('beforeCycle', function(){

  });


//-----------------------------------------------------------------------------
//Public Functions

//Called to initialize
exports.init = function (AXCB, BCB){
  AxeCallback = AXCB;
  ButtonCallback = BCB;
}

exports.setThreshold = function(value){
  zeroThreshold = value;
  a = 1/(1-zeroThreshold);
  b = 1 - a;
}

exports.getThreshold = function(){
  return zeroThreshold;
}
