const {ipcMain} = require('electron');

var Window;

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
    callBack: 0,
    paramater: null
  }
}



buttonMap[14].callBack = 2;
buttonMap[14].paramater = 0;

buttonMap[12].callBack = 1;
buttonMap[12].paramater = 1;

buttonMap[15].callBack = 1;
buttonMap[15].paramater = 2;

buttonMap[13].callBack = 1;
buttonMap[13].paramater = 3;

buttonMap[9].callBack = 7;


function AxeAction(index, axeValues){
  if(mapMode){
    // send data to renderer process

  } else{
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
}

function ButtonPressed(index){
  console.log("button pressed "+index);
  //check if in map mode
  if(mapMode){
    // document.getElementById('button-'+index).classList.toggle('active', true);
  }
  // check if a funciton isassigned to this button
  else if(buttonMap[index].callBack > 0){
    //check if a pressed fucnction is assigned
    if(buttonCallbacks[buttonMap[index].callBack].pressed){
      console.log("calling function " + buttonCallbacks[buttonMap[index].callBack].name);
      buttonCallbacks[buttonMap[index].callBack].pressed(buttonMap[index].paramater);
    }
  } else{
    console.log("no function assigned to this button");
  }
}

function ButtonReleased(index){
  console.log("button released "+index);
  //check if in map mode
  if(mapMode){
    // document.getElementById('button-'+index).classList.toggle('active', false);
  }
  // check if a funciton isassigned to this button
  else if(buttonMap[index].callBack > 0){
    //check if a pressed fucnction is assigned
    if(buttonCallbacks[buttonMap[index].callBack].released){
      console.log("calling function " + buttonCallbacks[buttonMap[index].callBack].name);
      buttonCallbacks[buttonMap[index].callBack].released(buttonMap[index].paramater);
    }
  } else{
    console.log("no function assigned to this button");
  }

}




//-----------------------------------------------------------------------------
//Public Functions

//Called to initialize
exports.init = function (item, PTCB, ZCB){
  Window = item;
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



//-----------------------------------------------------------------------------
//from renderer process
ipcMain.on('AxeAction', function(event, index, values){
  AxeAction(index, values);
})

ipcMain.on('ButtonAction', function(event, index, value){
  if (value){ButtonPressed(index);}
  else{ButtonReleased(index);}
})
