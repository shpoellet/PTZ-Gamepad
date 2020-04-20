var Window;
const {ipcMain} = require('electron');

const http = require('http');



const Camera = require('./Camera.js');

var cameraCount = 8;

var Cameras = [];
for (var i = 0; i < cameraCount; i++) {
  Cameras[i] = new Camera();
}

var selectedCamera = 0;

var mappedPan = 50;
var mappedTilt = 50;
var mappedZoom = 50;

var PTspeed = 50;
var ZoomSpeed = 50;

var packetCount = 1;


//private funcitons
function selectCamera(index){
  processPT(0,0);
  processZoom(0);
  selectedCamera = index;
  GUI_selectCamera();
}

function setConnectState(index, state){
  if(state != Cameras[index].connected){
    // the state changed so update the record and the GUI
    Cameras[index].connected = state;
    GUI_connectCamera(index);
  }
}


function recallPreset(index){
  let command = 'http://'+
                Cameras[selectedCamera].address + ':' +
                Cameras[selectedCamera].port + '/cgi-bin/aw_ptz?cmd=%23R';
  if(index < 10){command = command + 0}
  command = command + index + '&res=1';
  http.get(command);
}

function storePreset(index){
  let command = 'http://'+
                Cameras[selectedCamera].address + ':' +
                Cameras[selectedCamera].port + '/cgi-bin/aw_ptz?cmd=%23M';
  if(index < 10){command = command + 0}
  command = command + index + '&res=1';
  http.get(command);
}

function setManualFocus(){
  let command = 'http://'+
              Cameras[selectedCamera].address + ':' +
              Cameras[selectedCamera].port + '/cgi-bin/aw_ptz?cmd=%23D10&res=1';
  http.get(command);
}


function setAutoFocus(){
  let command = 'http://'+
              Cameras[selectedCamera].address + ':' +
              Cameras[selectedCamera].port + '/cgi-bin/aw_ptz?cmd=%23D11&res=1';
  http.get(command);
}

function setOTAF(){
  let command = 'http://'+
            Cameras[selectedCamera].address + ':' +
            Cameras[selectedCamera].port + '/cgi-bin/aw_cam?cmd=OSE:69:1&res=1';
  http.get(command);
}

function adjustFocus(cmd){
  let command = 'http://'+
            Cameras[selectedCamera].address + ':' +
            Cameras[selectedCamera].port + '/cgi-bin/aw_ptz?cmd=%23F';

  switch(cmd){
    case 'near':
      command = command + '40&res=1';
      break;
    case 'far':
      command = command + '60&res=1';
      break;
    default:
    command = command + '50&res=1';
  }

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
  for (var i = 0; i < cameraCount; i++) {

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


function cameraPing(index){
  let cameraId = index;
  let count = packetCount;
  let command = 'http://'+
                Cameras[cameraId].address + ':' +
                Cameras[cameraId].port + '/cgi-bin/aw_ptz?cmd=%23O&res=1';

  //send command

  http.get(command, (res) => {
    const { statusCode } = res;

    let error;
    if (statusCode !== 200) {
      console.error('Request Failed.\n' +  `Status Code: ${statusCode}`);
      res.resume();
      return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      if (rawData == 'p1'){
          if (count > Cameras[cameraId].connectCount){
            Cameras[cameraId].connectCount = count;
          }
      }
    });
  }).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
  });
}


function getLiveData(){
//request live data paramters from the camera
//this functions currently on polls the auto focus stats at this timeout
//if more values are needed in the fure this fucntion should be split up

  //creat a local copy of Varialbes tha can be passed into a call back fucntion
  let cameraId = selectedCamera;

  //the http get command
  let command = 'http://'+
                Cameras[cameraId].address + ':' +
                Cameras[cameraId].port + '/cgi-bin/aw_ptz?cmd=%23D1&res=1';

  // send the command and creat a callback for the response
  http.get(command, (res) => {
    const { statusCode } = res;

    //check if there were any erros in the response
    let error;
    if (statusCode !== 200) {
      console.error('Request Failed.\n' +  `Status Code: ${statusCode}`);
      res.resume();
      return;
    }

    //read the data
    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      //process the returned data
      let change = false;
      if (rawData == 'd10'){
        if(Cameras[cameraId].liveValues.autoFocus){
          change = true;
          Cameras[cameraId].liveValues.autoFocus = false;
        }
      } else if(rawData == 'd11'){
        if (!Cameras[cameraId].liveValues.autoFocus){
          change = true;
          Cameras[cameraId].liveValues.autoFocus = true;
        }
      }
      //if there was a change in th state updae the gui
      if(change && cameraId == selectedCamera){
        GUI_displayLiveValues();
      }
    });
  }).on('error', (e) => {
    //listen for timeouts
    console.error(`Got error: ${e.message}`);
  });
}




function connectLoop(){
  for (var i = 0; i < cameraCount; i++) {
    if(Cameras[i].enabled){
      cameraPing(i);

      if(packetCount - Cameras[i].connectCount < 3){
        setConnectState(i, true);
      } else{
        setConnectState(i, false);
      }
    }
  }
  packetCount++;

  if(Cameras[selectedCamera].connected){
    getLiveData();
  }
}


//public functions
exports.init = function(item){
  Window = item;
  GUI_updateSettings();
  setInterval(PTZloop, 130);
  setInterval(connectLoop, 1000);
}


//GUI Commands
function GUI_selectCamera(){
  Window.webContents.send('selectCamera', selectedCamera, Cameras[selectedCamera]);
}

function GUI_connectCamera(index){
  Window.webContents.send('connectCamera', index, Cameras[index]);
}

function GUI_updateSettings(){
  Window.webContents.send('updateSettings', Cameras, selectedCamera);
}

function GUI_displayLiveValues(){
  Window.webContents.send('displayLiveValues', Cameras[selectedCamera].liveValues);
  console.log(Cameras[selectedCamera].liveValues)
}


//from GUI

ipcMain.on('selectCamera', function(event, index){
  selectCamera(index);
})

ipcMain.on('saveSettings', function(event, values){
  for (var i = 0; i < cameraCount; i++) {
    Cameras[i].enabled = values[i].enabled;
    if(Cameras[i].enabled == false){Cameras[i].connected = false}
    Cameras[i].address = values[i].address;
    Cameras[i].port = values[i].port;
  }
  GUI_updateSettings();
})

ipcMain.on('recallPreset', function(event, index){
  recallPreset(index);
})

ipcMain.on('recordPreset', function(event, index){
  storePreset(index);
  console.log("Record Preset" + index);
})

ipcMain.on('setAutoFocus', function(event){
  setAutoFocus();
})

ipcMain.on('setTouchFocus', function(event){
  setOTAF();
})

ipcMain.on('setManualFocus', function(event){
  setManualFocus();
})

ipcMain.on('adjustFocus', function(event, direction){
  adjustFocus(direction);
})

ipcMain.on('setPTspeed', function(event, value){
  PTspeed=value;
})

ipcMain.on('setZoomSpeed', function(event, value){
  ZoomSpeed = value;
})

ipcMain.on('PanTilt', function(event, pan, tilt){
  processPT(pan, tilt);
})

ipcMain.on('Zoom', function(event, value){
  processZoom(value);
})
