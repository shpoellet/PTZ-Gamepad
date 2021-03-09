const {ipcMain} = require('electron');

var Window;

var mapMode = false;
var axeSwap = false;
var invertTilt = false;
var zeroThreshold = 0.04;

var PanTiltCallback;
var ZoomCallback;

var buttonCallbacks = [];

var buttonMap = [];

for (let i = 0; i < 17; i++) {
  buttonMap[i]={
    callBack: 0,
    parameter: null
  }
}

function AxeAction(index, axeValues){
  let axe = index;
  if(axeSwap){axe = index == 0 ? 1 : 0;}
  if(axe == 1){
    // Pan Tilt values
    let x = Math.round(axeValues[0]*100);
    let y = Math.round(axeValues[1]*-100);
    if(invertTilt){y=y*-1};
    PanTiltCallback(x,y);
    Window.webContents.send('drawPT', [x, y]);
  } else{
    let y = Math.round(axeValues[1]*-100);
    ZoomCallback(y);
    Window.webContents.send('drawZoom', y);
  }
}

function ButtonPressed(index){
  // check if a funciton isassigned to this button
  if(buttonMap[index].callBack > 0){
    //check if a pressed fucnction is assigned
    if(buttonCallbacks[buttonMap[index].callBack].pressed){
      buttonCallbacks[buttonMap[index].callBack].pressed(buttonMap[index].parameter);
    }
  }
}

function ButtonReleased(index){
  // check if a funciton isassigned to this button
  if(buttonMap[index].callBack > 0){
    //check if a pressed fucnction is assigned
    if(buttonCallbacks[buttonMap[index].callBack].released){
      buttonCallbacks[buttonMap[index].callBack].released(buttonMap[index].parameter);
    }
  }
}

function UpdateGuiMap(){
  Window.webContents.send('UpdateGuiMap', buttonMap, axeSwap, invertTilt, zeroThreshold);
}



//-----------------------------------------------------------------------------
//Public Functions

//Called to initialize
exports.init = function (item, PTCB, ZCB){
  Window = item;
  PanTiltCallback = PTCB;
  ZoomCallback = ZCB;
  Window.webContents.send('setThreshold', zeroThreshold);
  UpdateGuiMap();
}

exports.attachButtonCallback = function(index, name, value, pressedCB, releasedCB){
  buttonCallbacks[index] = {
    name: name,
    value: value,
    pressed: pressedCB,
    released: releasedCB
  }
}

exports.setThreshold = function(value){
  zeroThreshold = value;
  Window.webContents.send('setThreshold', zeroThreshold);
}

exports.getThreshold = function(){
  return zeroThreshold;
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

exports.assignButton = function(index, action, value = null){
  buttonMap[index].callBack = action;
  buttonMap[index].parameter = value;
}

exports.removeButton = function(index){
  buttonMap[index].callBack = 0;
  buttonMap[index].parameter = null;
}

exports.getMap = function(){
  return buttonMap;
}

exports.setMap = function(newMap){
  buttonMap = newMap;
  UpdateGuiMap();
}

exports.clearMap = function(){
  mapMode = false;
  axeSwap = false;
  invertTilt = false;
  zeroThreshold = 0.04;

  for (let i = 0; i < 17; i++) {
    buttonMap[i]={
      callBack: 0,
      parameter: null
    }
  }
  UpdateGuiMap();
}

//-----------------------------------------------------------------------------
//from renderer process
ipcMain.on('AxeAction', function(event, index, values){
  AxeAction(index, values);
});

ipcMain.on('ButtonAction', function(event, index, value){
  if (value){ButtonPressed(index);}
  else{ButtonReleased(index);}
});

ipcMain.on('saveMap', function(event, newMap, newAxeSwap, newTiltInvert, newThreshold){
  for(let i = 0; i < 17; i++){
    buttonMap[i].callBack = newMap[i].callBack;
    buttonMap[i].parameter = newMap[i].parameter;
  }
  axeSwap = newAxeSwap;
  invertTilt = newTiltInvert;
  zeroThreshold = newThreshold;
  UpdateGuiMap();
});

ipcMain.on('setMapMode', function(event, value){
  mapMode = value;
});
