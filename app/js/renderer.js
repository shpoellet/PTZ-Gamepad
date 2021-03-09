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

var mapMode = false;
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
  let newValues = [];
  for (let i = 0; i < 8; i++) {
    newValues[i] = {
      enabled : document.getElementById("SETTINGS_CAMERA_ENABLED_"+i).checked,
      address : document.getElementById("SETTINGS_CAMERA_ADDRESS_"+i).value,
      port : null
    }

    let newPort = Math.floor(document.getElementById("SETTINGS_CAMERA_PORT_"+i).value)
    if(newPort < 1){newPort = 1}
    newValues[i].port = newPort;
    console.log(newValues[i].address.length)
  }
  ipcRenderer.send('saveSettings', newValues);
  closeSettingsPane();
}


function saveMap(){
  let newMap = [];
  for (let i = 0; i < 17; i++){
    newMap[i]={
    callBack: document.getElementById("MAP_BUTTON_ACTION_"+i).value,
    parameter: null
    }

    switch (+newMap[i].callBack) {
      case 1:

        let newValue1 = Math.floor(document.getElementById("BUTTON_VALUE_"+i).value);
        console.log(newValue1)
        if(newValue1 < 1){
          newMap[i].parameter = 0;
        } else if(newValue1 > 8){
          newMap[i].parameter = 7;
        } else{
          newMap[i].parameter = newValue1 - 1;
        }
        break;
      case 2:
        let newValue2 = Math.floor(document.getElementById("BUTTON_VALUE_"+i).value);
        if(newValue2 < 1){
          newMap[i].parameter = 0;
        } else if(newValue2 > 32){
          newMap[i].parameter = 31;
        } else{
          newMap[i].parameter = newValue2 - 1;
        }
        break;
      case 8:
      case 9:
        let newValue8 = Math.floor(document.getElementById("BUTTON_VALUE_"+i).value);
        if(newValue8 < 0){
          newMap[i].parameter = 0;
        } else if(newValue8 > 100){
          newMap[i].parameter = 100;
        } else{
          newMap[i].parameter = newValue8;
        }
        break;
    }
  }

  let newThreshold = Math.floor(document.getElementById("THRESHOLD_INPUT").value*100)/100;

  if(newThreshold < 0){
    newThreshold = 0;
  } else if(newThreshold > 0.5){
    newThreshold = 0.5;
  }
  ipcRenderer.send('saveMap', newMap,
                        document.getElementById("AXE_SWAP_CHECKBOX").checked,
                        document.getElementById("INVERT_TILT_CHECKBOX").checked,
                        newThreshold);
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

//Page Navigation Page Clicks

document.getElementById("SETTINGS_GEAR").onmousedown = function(){
  document.getElementById("SETTINGS_MASK_PANE").style.display = 'block';
  document.getElementById("SETTINGS_PANE").style.display = 'block';
}

function closeSettingsPane(){
  document.getElementById("SETTINGS_MASK_PANE").style.display = 'none';
  document.getElementById("SETTINGS_PANE").style.display = 'none';
}

function openMapPane(){
  document.getElementById("PAD_MAP_PANE").style.display = 'block';
  mapMode = true;
}

function closeMapPane(){
  document.getElementById("PAD_MAP_PANE").style.display = 'none';
  mapMode = false;
}

//Other Button Clicks
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

function ClearMap(){
  ipcRenderer.send('clearMap');
}

function ClearConfig(){
  ipcRenderer.send('clearConfig');
}

//sliders

function PTspeedSlider(value){
  ipcRenderer.send('setPTspeed', value);
}

function ZoomSpeedSlider(value){
  ipcRenderer.send('setZoomSpeed', value);
}

function EnableButtonInput(index){
  let callBackID = document.getElementById("MAP_BUTTON_ACTION_"+index).value;
  if(callBackID == 1 || callBackID == 2 || callBackID == 8 || callBackID == 9){
    document.getElementById("BUTTON_VALUE_"+index).value = 1;
    document.getElementById("BUTTON_VALUE_"+index).disabled = false;
  }
  else {
    document.getElementById("BUTTON_VALUE_"+index).value = null;
    document.getElementById("BUTTON_VALUE_"+index).disabled = true;
  }
}

function ChangeAxeLabels(){
  let axeSwap = document.getElementById("AXE_SWAP_CHECKBOX").checked;
  if(axeSwap){
    document.getElementById("MAP_LEFT_FUNCTION").innerHTML = "Pan/Tilt";
    document.getElementById("MAP_RIGHT_FUNCTION").innerHTML = "Zoom";
  }else{
    document.getElementById("MAP_LEFT_FUNCTION").innerHTML = "Zoom";
    document.getElementById("MAP_RIGHT_FUNCTION").innerHTML = "Pan/Tilt";
  }
}

//-----------------------------------------------------------------------------
//Gamepad functions

function AxeAction(index, axeValues){
  //callback for when the gamepad axes move
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
  }else{
    //received data from the Gamepad interface and send it to the main process
    ipcRenderer.send('AxeAction', index, axeValues);
  }
}

function ButtonAction(index, value){
  //callback for when a gamepad button is pressed or releasedCB
  if(mapMode){
    document.getElementById('button-'+index).classList.toggle('active', value);
  }else{
    //received data from the Gamepad interface and send it to the main process
    ipcRenderer.send('ButtonAction', index, value);
  }
}

function setThreshold(value){
  Gamepad.setThreshold(value);
}

//Attach the callbacks to the Gamepad interfae
Gamepad.init(AxeAction, ButtonAction);

//-----------------------------------------------------------------------------
//data passed from the main process
//-----------------------------------------------------------------------------

ipcRenderer.on('updateSettings', function(event, Cameras, Selected, newMap){
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
    if(buttonMap[i].callBack == 1 || buttonMap[i].callBack == 2){
      document.getElementById("BUTTON_VALUE_"+i).value = +buttonMap[i].parameter + 1;
      document.getElementById("BUTTON_VALUE_"+i).disabled = false;
    }
    else if(buttonMap[i].callBack == 8 || buttonMap[i].callBack == 9){
      document.getElementById("BUTTON_VALUE_"+i).value = +buttonMap[i].parameter;
      document.getElementById("BUTTON_VALUE_"+i).disabled = false;
    }
    else{
      document.getElementById("BUTTON_VALUE_"+i).value = null;
      document.getElementById("BUTTON_VALUE_"+i).disabled = true;
    }
  }
  document.getElementById("AXE_SWAP_CHECKBOX").checked = axeSwap;
  if(axeSwap){
    document.getElementById("MAP_LEFT_FUNCTION").innerHTML = "Pan/Tilt";
    document.getElementById("MAP_RIGHT_FUNCTION").innerHTML = "Zoom";
  }else{
    document.getElementById("MAP_LEFT_FUNCTION").innerHTML = "Zoom";
    document.getElementById("MAP_RIGHT_FUNCTION").innerHTML = "Pan/Tilt";
  }
  document.getElementById("INVERT_TILT_CHECKBOX").checked = invertTilt;
  document.getElementById("THRESHOLD_INPUT").value = zeroThreshold;
})
