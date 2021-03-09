const {ipcRenderer} = require('electron');

// require("../js/gamecontroller.js");

const Gamepad = require("../js/gamepad.js");
// https://www.npmjs.com/package/gamecontroller.js
//Local Varialbes
var recordMode = false;
var selectedCamera = 0;

var pan = 0;
var tilt = 0;
var zoom = 0;

var axeSwap = false;
var invertTilt = false;

//local functions


function displayCameraStatus(index, enabled, connected){
  //displays the status of the cameras
  if(enabled){
    if(connected){
      document.getElementById("CAMERA_SELECT_" + index).style.borderColor = '#F4D03F';
    } else{
      document.getElementById("CAMERA_SELECT_" + index).style.borderColor = '#C0392B';
    }
  } else{
    document.getElementById("CAMERA_SELECT_"  + index).style.borderColor = 'grey';
  }
}

function displaySelectedCamera(index){
  //highlights the selected camera
  for (var i = 0; i < 8; i++) {
    if(i == index){
      document.getElementById("CAMERA_SELECT_"  + i).style.backgroundColor = '#27AE60';
    } else{
      document.getElementById("CAMERA_SELECT_"  + i).style.backgroundColor = '';
    }
  }
}

function displayCameraNotEnabled(){
  //displays the camera mask and displays a message
  document.getElementById("CAMERA_STATUS_MASK_PANE").innerHTML = 'This camera is not enabled.<br>Please enable it in the settings menu.';
  document.getElementById("CAMERA_STATUS_MASK_PANE").style.display = 'block';
}

function displayCameraNotConnected(){
  //displays the camera mask and displays a message
  document.getElementById("CAMERA_STATUS_MASK_PANE").innerHTML = 'This camera is not connected.<br>Please check the network connection.';
  document.getElementById("CAMERA_STATUS_MASK_PANE").style.display = 'block';
}

function displayCameraValues(liveValues){
  document.getElementById("CAMERA_STATUS_MASK_PANE").style.display = 'none';
  if(liveValues.autoFocus){
    document.getElementById("AF_BUTTON").style.borderColor = 'white';
    document.getElementById("MF_BUTTON").style.borderColor = '';
  } else{
    document.getElementById("AF_BUTTON").style.borderColor = '';
    document.getElementById("MF_BUTTON").style.borderColor = 'white';
  }
  //displays the live values received from the camera
}

function setSelectedCamera(index, cameraValues){
  if(recordMode){setRecordMode(false);}
  selectedCamera = index;
  displaySelectedCamera(index);
  if(!cameraValues.enabled){
    displayCameraNotEnabled();
  }else if(!cameraValues.connected){
    displayCameraNotConnected();
  }else{
    displayCameraValues(cameraValues.liveValues);
  }
}

function saveMap(){
  // var newValues = [];
  // for (var i = 0; i < 8; i++) {
  //   newValues[i] = {
  //     enabled : document.getElementById("SETTINGS_CAMERA_ENABLED_"+i).checked,
  //     address : document.getElementById("SETTINGS_CAMERA_ADDRESS_"+i).value,
  //     port : document.getElementById("SETTINGS_CAMERA_PORT_"+i).value
  //   }
  // }
  // ipcRenderer.send('saveSettings', newValues);
  closeMapPane();
}

function saveSettings(){
  var newValues = [];
  for (var i = 0; i < 8; i++) {
    newValues[i] = {
      enabled : document.getElementById("SETTINGS_CAMERA_ENABLED_"+i).checked,
      address : document.getElementById("SETTINGS_CAMERA_ADDRESS_"+i).value,
      port : document.getElementById("SETTINGS_CAMERA_PORT_"+i).value
    }
  }
  ipcRenderer.send('saveSettings', newValues);
  closeSettingsPane();
}

function setRecordMode(state){
  //sets the record state of the preset interface
  //record mode = red outline on buttons and cancel on record button
  recordMode = state;
  if(recordMode){
    for (var i = 0; i < 32; i++) {
      document.getElementById("PRESET_SELECT_" + i).style.borderColor = '#CD6155';
    }
    document.getElementById("PRESET_RECORD_BUTTON").innerHTML='CANCEL';
  } else{
    for (var i = 0; i < 32; i++) {
      document.getElementById("PRESET_SELECT_" + i).style.borderColor = '#505050';
    }
    document.getElementById("PRESET_RECORD_BUTTON").innerHTML='RECORD';
  }
}


//PTZ functions

function processPT(x, y){
  if(pan!=x || tilt!=y){
    pan = x;
    tilt = y;
    drawPT();
    ipcRenderer.send('PanTilt', pan, tilt);
  }
}

function processZoom(y){
  if(zoom!=y){
    zoom = y;
    drawZoom();
    ipcRenderer.send('Zoom', zoom);
  }
}

//PT Display functions
function drawPT(){
  let xPos = 50 + ((pan/100)*50);
  let yPos = 50 - ((tilt/100)*50);
  document.getElementById("PT_DOT").style.left=xPos+'%';
  document.getElementById("PT_DOT").style.top=yPos+'%';
}

function drawZoom(){
  let yPos = 50 - ((zoom/100)*50);
  document.getElementById("ZOOM_DOT").style.top=yPos+'%';
}


//flash buttons
function blinkPreset(index){
  document.getElementById("PRESET_SELECT_"+index).style.backgroundColor = '#909090';
  setTimeout(function(){
    document.getElementById("PRESET_SELECT_"+index).style.backgroundColor = '';},250);
}

function blinkMF(){
  document.getElementById("MF_BUTTON").style.backgroundColor = '#909090';
  setTimeout(function(){
    document.getElementById("MF_BUTTON").style.backgroundColor = '';},250);
}

function blinkAF(){
  document.getElementById("AF_BUTTON").style.backgroundColor = '#909090';
  setTimeout(function(){
    document.getElementById("AF_BUTTON").style.backgroundColor = '';},250);
}

function blinkOTAF(index){
  document.getElementById("OTAF_BUTTON").style.backgroundColor = '#909090';
  setTimeout(function(){
    document.getElementById("OTAF_BUTTON").style.backgroundColor = '';},250);
}

function blinkMFnear(state){
  if(state){
    document.getElementById("FOCUS-BUTTON").style.backgroundColor = '#909090';
  } else{
    document.getElementById("FOCUS-BUTTON").style.backgroundColor = '';
  }
}

function blinkMFfar(state){
  if(state){
    document.getElementById("FOCUS+BUTTON").style.backgroundColor = '#909090';
  } else{
    document.getElementById("FOCUS+BUTTON").style.backgroundColor = '';
  }
}


//data passed from the main process

ipcRenderer.on('updateSettings', function(event, Cameras, Selected){
  for (var i = 0; i < Cameras.length; i++) {
    document.getElementById("SETTINGS_CAMERA_ENABLED_"+i).checked = Cameras[i].enabled;
    document.getElementById("SETTINGS_CAMERA_ADDRESS_"+i).value = Cameras[i].address;
    document.getElementById("SETTINGS_CAMERA_PORT_"+i).value = Cameras[i].port;
    displayCameraStatus(i, Cameras[i].enabled, Cameras[i].connected)
  }
  setSelectedCamera(Selected, Cameras[Selected]);
})

ipcRenderer.on('selectCamera', function(event, index, cameraValues){
  setSelectedCamera(index, cameraValues);
})

ipcRenderer.on('connectCamera', function(event, index, cameraValues){
  displayCameraStatus(index, cameraValues.enabled, cameraValues.connected);
  if(index == selectedCamera){
    setSelectedCamera(index, cameraValues);
  }
})

ipcRenderer.on('displayLiveValues', function(event, liveValues){
  displayCameraValues(liveValues);
})



// Button Clicks

function CameraSelectButton(index){
  ipcRenderer.send('selectCamera', index);
}

function PresetSelectButton(index){
  if(recordMode){
    ipcRenderer.send('recordPreset', index);
    setRecordMode(false);
  } else{
    ipcRenderer.send('recallPreset', index);
  }
}

function RecordButton(){
  if(recordMode){
    setRecordMode(false);
  } else{
    setRecordMode(true);
  }
}

function AutoFocusButton(){
  ipcRenderer.send('setAutoFocus');
}

function OneTouchButton(){
  ipcRenderer.send('setTouchFocus');

}

function ManaulFocusButton(){
  ipcRenderer.send('setManualFocus');

}

function FocusButton(direction){
  ipcRenderer.send('adjustFocus', direction);
}

//sliders

function PTspeedSlider(value){
  ipcRenderer.send('setPTspeed', value);
}

function ZoomSpeedSlider(value){
  ipcRenderer.send('setZoomSpeed', value);
}



Gamepad.init(processPT, processZoom);

Gamepad.attachButtonCallback(0,'Select Camera', true,
    function(index){ipcRenderer.send('selectCamera', index);},
    null);

Gamepad.attachButtonCallback(1,'Recall Preset', true,
    function(index){ipcRenderer.send('recallPreset', index); blinkPreset(index);},
    null);

Gamepad.attachButtonCallback(2,'Auto Focus', false,
    function(index){ipcRenderer.send('setAutoFocus');  blinkAF();},
    null);

Gamepad.attachButtonCallback(3,'Manual Focus', false,
    function(index){ipcRenderer.send('setManualFocus');  blinkMF();},
    null);

Gamepad.attachButtonCallback(4,'Focus Near', false,
    function(index){ipcRenderer.send('adjustFocus', 'near'); blinkMFnear(true);},
    function(index){ipcRenderer.send('adjustFocus', 'stop'); blinkMFnear(false);});

Gamepad.attachButtonCallback(5,'Focus Far', false,
    function(index){ipcRenderer.send('adjustFocus', 'far'); blinkMFfar(true);},
    function(index){ipcRenderer.send('adjustFocus', 'stop'); blinkMFfar(false);});

Gamepad.attachButtonCallback(6,'Touch Focus', false,
    function(index){ipcRenderer.send('setTouchFocus');  blinkOTAF();},
    null);

// //gamepad
// function GP_ButtonPressed(index){
//   console.log("button "+index);
//   switch(index){
//     case 11: document.getElementById('button-4').classList.toggle('active', true);
//     case 14: ipcRenderer.send('selectCamera', 0);break;
//     case 12: ipcRenderer.send('selectCamera', 1);break;
//     case 15: ipcRenderer.send('selectCamera', 2);break;
//     case 13: ipcRenderer.send('selectCamera', 3);break;
//   }
//
// }
//
// function GP_ButtonReleased(index){
//   console.log("button "+index);
//   switch(index){
//     case 11: document.getElementById('button-4').classList.toggle('active', false);
//     case 14: ipcRenderer.send('selectCamera', 0);break;
//     case 12: ipcRenderer.send('selectCamera', 1);break;
//     case 15: ipcRenderer.send('selectCamera', 2);break;
//     case 13: ipcRenderer.send('selectCamera', 3);break;
//   }
//
// }
//
// function GP_Axes(index, axeValues){
//   let threshold = 0.01;
//   let axe = index;
//   if(axeSwap){axe = index == 0 ? 1 : 0;}
//
//   if(axe == 1){
//     // Pan Tilt values
//     let x = Math.abs(axeValues[0]) > threshold ? Math.round(axeValues[0]*100) : 0;
//     let y = Math.abs(axeValues[1]) > threshold ? Math.round(axeValues[1]*-100) : 0;
//     if(invertTilt){y=y*-1};
//     processPT(x,y);
//   } else{
//     let y = Math.abs(axeValues[1]) > threshold ? Math.round(axeValues[1]*-100) : 0;
//     processZoom(y);
//   }
//
//
//
// }
//
// gameControl
//   .on('connect', function(gp){
//     for (let i = 0; i < Math.min(17, gp.buttons); i++) {
//       gp.before('button' + i, function(){
//         GP_ButtonPressed(i);
//       });
//       gp.after('button' + i, function(){
//         GP_ButtonReleased(i);
//       });
//     }
//
//   })
//   .on('afterCycle', function(){
//     GP_Axes(0, gameControl.getGamepad(0).axeValues[0]);
//     GP_Axes(1, gameControl.getGamepad(0).axeValues[1]);
//   })
//   .on('beforeCycle', function(){
//
//   });




// gamepad.on('button0',     () => {
//
//    console.log('Button 0 still pressed...');
//    console.log(gameControl.getGamepad(0).axeValues[0]);
//
//
//  })
// });/
