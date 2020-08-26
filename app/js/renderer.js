const {ipcRenderer} = require('electron');

// require("../js/gamecontroller.js");

const Gamepad = require("../js/gamepad-interface.js");
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




//-----------------------------------------------------------------------------
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


//-----------------------------------------------------------------------------
//Gamepad functions

function AxeAction(index, values){
  //callback for when the gamepad axes move
  //received data from the Gamepad interface and send it to the main process
  ipcRenderer.send('AxeAction', index, values);
}

function ButtonAction(index, value){
  //callback for when a gamepad button is pressed or releasedCB
  //received data from the Gamepad interface and send it to the main process
  ipcRenderer.send('ButtonAction', index, value);
}

function setThreshold(value){
  Gamepad.setThreshold(value);
}

//Attach the callbacks to the Gamepad interfae
Gamepad.init(AxeAction, ButtonAction);

//-----------------------------------------------------------------------------
//data passed from the main process
//-----------------------------------------------------------------------------

ipcRenderer.on('updateSettings', function(event, Cameras, Selected){
  for (let i = 0; i < Cameras.length; i++) {
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

ipcRenderer.on('drawPT', function(event, values){
  pan = values[0];
  tilt = values[1];
  drawPT();
})

ipcRenderer.on('drawZoom', function(event, value){
  zoom = value;
  drawZoom();
})

ipcRenderer.on('blinkPreset', function(event, index){blinkPreset(index);});

ipcRenderer.on('blinkAF', blinkAF);

ipcRenderer.on('blinkMF', blinkMF);

ipcRenderer.on('blinkMFnear', function(event, value){blinkMFnear(value);});

ipcRenderer.on('blinkMFfar', function(event, value){blinkMFfar(value);});

ipcRenderer.on('blinkOTAF', blinkOTAF);

ipcRenderer.on('setThreshold', function(event, value){setThreshold(value);});


ipcRenderer.on('UpdateGuiMap', function(event, buttonMap, axeSwap, invertTilt, zeroThreshold){
  for (let i = 0; i < buttonMap.length; i++) {
    document.getElementById("MAP_BUTTON_ACTION_"+i).value = buttonMap[i].callBack;
    document.getElementById("BUTTON_VALUE_"+i).value = buttonMap[i].paramater;
  }
  document.getElementById("AXE_SWAP_CHECKBOX").checked = axeSwap;
  document.getElementById("INVERT_TILT_CHECKBOX").checked = invertTilt;
  document.getElementById("THRESHOLD_INPUT").value = zeroThreshold;
})
