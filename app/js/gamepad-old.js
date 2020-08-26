require("../js/gamecontroller.js");
// https://www.npmjs.com/package/gamecontroller.js
var mapMode = false;
var axeSwap = false;
var invertTilt = false;
var zeroThreshold = 0.02;

var PanTiltCallback;
var ZoomCallback;

var buttonCallbacks = [];

var buttonMap = [];

for (let i = 0; i < 17; i++) {
  buttonMap[i]={
    callBack: -1,
    paramater: null
  }
}

buttonMap[14].callBack = 0;
buttonMap[14].paramater = 0;

buttonMap[12].callBack = 0;
buttonMap[12].paramater = 1;

buttonMap[15].callBack = 0;
buttonMap[15].paramater = 2;

buttonMap[13].callBack = 0;
buttonMap[13].paramater = 3;

buttonMap[0].callBack = 1;
buttonMap[0].paramater = 0;

buttonMap[1].callBack = 1;
buttonMap[1].paramater = 1;

buttonMap[2].callBack = 1;
buttonMap[2].paramater = 2;

buttonMap[3].callBack = 1;
buttonMap[3].paramater = 3;

buttonMap[8].callBack = 2;

buttonMap[9].callBack = 3;

buttonMap[4].callBack = 4;

buttonMap[5].callBack = 5;

buttonMap[10].callBack = 6;


//gamepad
function GP_ButtonPressed(index){
  console.log("button pressed "+index);
  //check if in map mode
  if(mapMode){
    document.getElementById('button-'+index).classList.toggle('active', true);
  }
  // check if a funciton isassigned to this button
  else if(buttonMap[index].callBack >= 0){
    //check if a pressed fucnction is assigned
    if(buttonCallbacks[buttonMap[index].callBack].pressed){
      console.log("calling function " + buttonCallbacks[buttonMap[index].callBack].name);
      buttonCallbacks[buttonMap[index].callBack].pressed(buttonMap[index].paramater);
    }
  } else{
    console.log("no function assigned to this button");
  }
}

function GP_ButtonReleased(index){
  console.log("button released "+index);
  //check if in map mode
  if(mapMode){
    document.getElementById('button-'+index).classList.toggle('active', false);
  }
  // check if a funciton isassigned to this button
  else if(buttonMap[index].callBack >= 0){
    //check if a pressed fucnction is assigned
    if(buttonCallbacks[buttonMap[index].callBack].released){
      console.log("calling function " + buttonCallbacks[buttonMap[index].callBack].name);
      buttonCallbacks[buttonMap[index].callBack].released(buttonMap[index].paramater);
    }
  } else{
    console.log("no function assigned to this button");
  }

}

function GP_Axes(index, axeValues){
  if(mapMode){
    let mapThreshold = 0.5;
    document.getElementById('axe-'+index+'-up').classList.toggle('active', false);
    document.getElementById('axe-'+index+'-down').classList.toggle('active', false);
    document.getElementById('axe-'+index+'-right').classList.toggle('active', false);
    document.getElementById('axe-'+index+'-left').classList.toggle('active', false);
    if(axeValues[0] < -mapThreshold){
      document.getElementById('axe-'+index+'-left').classList.toggle('active', true);
    } else if(axeValues[0] > mapThreshold){
      document.getElementById('axe-'+index+'-right').classList.toggle('active', true);
    }
    if(axeValues[1] < -mapThreshold){
      document.getElementById('axe-'+index+'-up').classList.toggle('active', true);
    } else if(axeValues[1] > mapThreshold){
      document.getElementById('axe-'+index+'-down').classList.toggle('active', true);
    }



  } else{
    let axe = index;
    if(axeSwap){axe = index == 0 ? 1 : 0;}
    if(axe == 1){
      // Pan Tilt values
      let x = Math.abs(axeValues[0]) > zeroThreshold ? Math.round(axeValues[0]*100) : 0;
      let y = Math.abs(axeValues[1]) > zeroThreshold ? Math.round(axeValues[1]*-100) : 0;
      if(invertTilt){y=y*-1};
      PanTiltCallback(x,y);
    } else{
      let y = Math.abs(axeValues[1]) > zeroThreshold ? Math.round(axeValues[1]*-100) : 0;
      ZoomCallback(y);
    }
  }
}

gameControl
  .on('connect', function(gp){
    for (let i = 0; i < Math.min(17, gp.buttons); i++) {
      gp.before('button' + i, function(){
        GP_ButtonPressed(i);
      });
      gp.after('button' + i, function(){
        GP_ButtonReleased(i);
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

//Called to initialize the wagon
exports.init = function (PTCB, ZCB){
  PanTiltCallback = PTCB;
  ZoomCallback = ZCB;

}

exports.attachButtonCallback = function(index, name, value, pressedCB, releasedCB){
  buttonCallbacks[index] = {
    name: name,
    value: value,
    pressed: pressedCB,
    released: releasedCB
  }
}

exports.setAxeSwap = function(value){
  axeSwap = value;
}

exports.getAxeSwap = function(){
  return axeSwap;
}

exports.setTiltInvert = function(value){
  invertTilt = value;
}

exports.getTiltInvert = function(){
  return invertTilt;
}

exports.setThreshold = function(value){
  zeroThreshold = value;
}

exports.getThreshold = function(){
  return zeroThreshold;
}
