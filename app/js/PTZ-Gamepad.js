var Window;
const {ipcMain} = require('electron');

const http = require('http');



const Camera = require('./Camera.js');

var camearaCount = 8;

var Cameras = [];
for (var i = 0; i < camearaCount; i++) {
  Cameras[i] = new Camera();
}

var selectedCamera = 0;

var mappedPan = 50;
var mappedTilt = 50;
var mappedZoom = 50;

var PTspeed = 50;
var ZoomSpeed = 50;


//private funcitons
function selectCamera(index){
  processPT(0,0);
  processZoom(0);
  selectedCamera = index;
  GUI_selectCamera();
}



function recallPreset(index){
  let command = 'http://'+
                Cameras[selectedCamera].address + ':' +
                Cameras[selectedCamera].port + '/cgi-bin/aw_ptz?cmd=%23R';
  if(index < 10){command = command + 0}
  command = command + index + '&res=1';
  http.get(command);
}

function processPT(pan, tilt){
  Cameras[selectedCamera].pan  = Math.round(50 + (( (pan *(PTspeed/100)) /100)*49));
  Cameras[selectedCamera].tilt = Math.round(50 + (( (tilt*(PTspeed/100)) /100)*49));
}

function processZoom(zoom){
  Cameras[selectedCamera].zoom  = Math.round(50 + (( (zoom *(ZoomSpeed/100)) /100)*49));
}


function PTZloop(){
  for (var i = 0; i < camearaCount; i++) {

    //check if the pan or tilt needs to be sent
    if(Cameras[i].enabled && Cameras[i].connected &&
                  (Cameras[i].pan != Cameras[i].sentPan ||
                   Cameras[i].tilt != Cameras[i].sentTilt)){

      // Generate http Command
      let command = 'http://'+
                    Cameras[i].address + ':' +
                    Cameras[i].port + '/cgi-bin/aw_ptz?cmd=%23PTS';
      if(Cameras[i].pan < 10){command = command + 0}
      command = command + Cameras[i].pan
      if(Cameras[i].tilt < 10){command = command + 0}
      command = command + Cameras[i].tilt + '&res=1';

      //send command
      http.get(command).on("error", (err)=>{console.log(err.message)});

      //update sent values
      Cameras[i].sentPan = Cameras[i].pan;
      Cameras[i].sentTilt = Cameras[i].tilt;
    }

    //check if the zoom needs to be sent
    if(Cameras[i].enabled && Cameras[i].connected &&
                  Cameras[i].zoom != Cameras[i].sentZoom){

      // Generate http Command
      command = 'http://'+
                    Cameras[i].address + ':' +
                    Cameras[i].port + '/cgi-bin/aw_ptz?cmd=%23Z';
      if(Cameras[i].zoom < 10){command = command + 0}
      command = command + Cameras[i].zoom + '&res=1';

      //send command
      http.get(command).on("error", (err)=>{console.log(err.message)});

      //update sent values
      Cameras[i].sentZoom = Cameras[i].zoom;
    }
  }
}



//public functions
exports.init = function(item){
  Window = item;
  GUI_updateSettings();
  setInterval(PTZloop, 130);
}


//GUI Commands
function GUI_selectCamera(){
  Window.webContents.send('selectCamera', selectedCamera, Cameras[selectedCamera]);
}

function GUI_updateSettings(){
  Window.webContents.send('updateSettings', Cameras, selectedCamera);
}

function GUI_PTdisplay(x, y){
  Window.webContents.send('PTdisplay', x, y);
}

function GUI_ZoomDisplay(value){
  Window.webContents.send('ZoomDisplay', value);
}


//from GUI

ipcMain.on('selectCamera', function(event, index){
  selectCamera(index);
})

ipcMain.on('saveSettings', function(event, values){
  for (var i = 0; i < camearaCount; i++) {
    Cameras[i].enabled = values[i].enabled;
    Cameras[i].address = values[i].address;
    Cameras[i].port = values[i].port;
  }
  GUI_updateSettings();
})

ipcMain.on('recallPreset', function(event, index){
  console.log("Recall Preset" + index);
  recallPreset(index);
})

ipcMain.on('recordPreset', function(event, index){
  console.log("Record Preset" + index);
})

ipcMain.on('setAutoFocus', function(event){
  console.log("Set Auto Focus");
})

ipcMain.on('setTouchFocus', function(event){
  console.log("OTAF");
})

ipcMain.on('setManualFocus', function(event){
  console.log("Set Manual Focus");
})

ipcMain.on('adjustFocus', function(event, index){
  console.log("Focus " + index);
})

ipcMain.on('setPTspeed', function(event, value){
  console.log("PT Speed " + value);
  PTspeed=value;
})

ipcMain.on('setZoomSpeed', function(event, value){
  console.log("Zoom Speed " + value);
  ZoomSpeed = value;
})

ipcMain.on('PanTilt', function(event, pan, tilt){
  processPT(pan, tilt);
})

ipcMain.on('Zoom', function(event, value){
  processZoom(value);
})
