var Window;
const {ipcMain} = require('electron');

const http = require('http');

const fs = require('fs')

const path = require('path')

const Camera = require('./Camera.js');

const Gamepad = require('./gamepad.js');

const appName = 'PTZ-Gamepad';

var saveDir;

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

var constantZoom = false;

var presetRecordMode = false;

var packetCount = 1;

//-----------------------------------------------------------------------------
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
  if(!Cameras[selectedCamera].connected){return;};
  let command = 'http://'+
                Cameras[selectedCamera].address + ':' +
                Cameras[selectedCamera].port + '/cgi-bin/aw_ptz?cmd=%23R';
  if(index < 10){command = command + 0}
  command = command + index + '&res=1';
  try{
    http.get(command).on("error", (err)=>{console.log(err.message)});;
  }
  catch(err){
    HTTPerror(err, cameraId);
  }
}

function storePreset(index){
  if(!Cameras[selectedCamera].connected){return;};
  let command = 'http://'+
                Cameras[selectedCamera].address + ':' +
                Cameras[selectedCamera].port + '/cgi-bin/aw_ptz?cmd=%23M';
  if(index < 10){command = command + 0}
  command = command + index + '&res=1';
  try{
    http.get(command).on("error", (err)=>{console.log(err.message)});;
  }
  catch(err){
    HTTPerror(err, cameraId);
  }
}

function setManualFocus(){
  if(!Cameras[selectedCamera].connected){return;};
  let command = 'http://'+
              Cameras[selectedCamera].address + ':' +
              Cameras[selectedCamera].port + '/cgi-bin/aw_ptz?cmd=%23D10&res=1';
  try{
    http.get(command).on("error", (err)=>{console.log(err.message)});;
  }
  catch(err){
    HTTPerror(err, cameraId);
  }
}


function setAutoFocus(){
  if(!Cameras[selectedCamera].connected){return;};
  let command = 'http://'+
              Cameras[selectedCamera].address + ':' +
              Cameras[selectedCamera].port + '/cgi-bin/aw_ptz?cmd=%23D11&res=1';
  try{
    http.get(command).on("error", (err)=>{console.log(err.message)});;
  }
  catch(err){
    HTTPerror(err, cameraId);
  }
}

function setOTAF(){
  if(!Cameras[selectedCamera].connected){return;};
  let command = 'http://'+
            Cameras[selectedCamera].address + ':' +
            Cameras[selectedCamera].port + '/cgi-bin/aw_cam?cmd=OSE:69:1&res=1';
  try{
    http.get(command).on("error", (err)=>{console.log(err.message)});;
  }
  catch(err){
    HTTPerror(err, cameraId);
  }
}

function adjustFocus(cmd){
  if(!Cameras[selectedCamera].connected){return;};
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

  try{
    http.get(command).on("error", (err)=>{console.log(err.message)});;
  }
  catch(err){
    HTTPerror(err, cameraId);
  }
}

function processPT(pan, tilt){
  Cameras[selectedCamera].pan  = Math.round(50 + (( (pan *(PTspeed/100)) /100)*49));
  Cameras[selectedCamera].tilt = Math.round(50 + (( (tilt*(PTspeed/100)) /100)*49));
}

function processZoom(zoom){
    Cameras[selectedCamera].zoom  = Math.round(50 + (( (zoom *(ZoomSpeed/100)) /100)*49));
}

function setConstantZoom(zoom){
  Cameras[selectedCamera].zoom = Math.round(50 + (zoom/100)*49);
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
      try{
        http.get(command).on("error", (err)=>{console.log(err.message)});
      }
      catch(err){
        HTTPerror(err, cameraId);
      }

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
      try{
        http.get(command).on("error", (err)=>{console.log(err.message)});
      }
      catch(err){
        HTTPerror(err, cameraId);
      }

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
  try{
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
  catch(err){
    HTTPerror(err, cameraId);
  }
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
  try{
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
        //if there was a change in the state updae the gui
        if(change && cameraId == selectedCamera){
          GUI_displayLiveValues();
        }
      });
    }).on('error', (e) => {
      //listen for timeouts
      console.error(`Got error: ${e.message}`);
    });
  }
  catch(err){
    HTTPerror(err, cameraId);
  }
}



function connectLoop(){
  //Camera Connection Loop
  //Runs on loop to check if the cameras are connected
  //step through the cameras
  for (var i = 0; i < cameraCount; i++) {
    //if enabled try and ping the camear
    if(Cameras[i].enabled){
      cameraPing(i);
      //if three packets are sent with no reply the camera is not connected
      if(packetCount - Cameras[i].connectCount < 3){
        setConnectState(i, true);
      } else{
        setConnectState(i, false);
      }
    }
  }
  packetCount++;
  //if the camera is connected poll it for live data
  if(Cameras[selectedCamera].connected){
    getLiveData();
  }
}

//-----------------------------------------------------------------------------
//Save File

function getAppDataPath() {
  switch (process.platform) {
    case "darwin": {
      saveDir = path.join(process.env.HOME, "Library", "Application Support", appName);
      break;
    }
    case "win32": {
      saveDir = path.join(process.env.APPDATA, appName);
      break;
    }
    case "linux": {
      saveDir = path.join(process.env.HOME, "."+appName);
      break;
    }
    default: {
      console.log("Can Not Save Unsupported platform!");
    }
  }
  console.log(saveDir);
}


function saveConfigToFile(){
  if(saveDir == null){
    getAppDataPath();

  }
  //check if the save directory exists, if not create it
  if (!fs.existsSync(saveDir)){
    // try{
    //   fs.mkdirSync(saveDir);
    // }catch(error){
    //   console.log("Unable to create save directory");
    // }
    fs.mkdirSync(saveDir);
  }

  //create data object
  let saveData = {
    Cameras: Cameras
  };

  //write data to file
  fs.writeFile(saveDir+'/config.json', JSON.stringify(saveData, null, 2), err => {
    if (err) {}
    //file written successfully
  })
}

function saveUserToFile(){
  if(saveDir == null){
    getAppDataPath();
  }
  //check if the save directory exists, if not create it
  if (!fs.existsSync(saveDir)){
    try{
      fs.mkdirSync(saveDir);
    }catch(error){
      console.log("Unable to create save directory");
    }
  }
  let saveData = {
    ButtonMap: Gamepad.getMap(),
    PanSpeed: PTspeed,
    ZoomSpeed: ZoomSpeed,
    ZeroThreshold: Gamepad.getThreshold(),
    AxeSwap: Gamepad.getAxeSwap(),
    InvertTilt: Gamepad.getTiltInvert()
  };

  fs.writeFile(saveDir+'/userSettings.json', JSON.stringify(saveData, null, 2), err => {
    if (err) {}
    //file written successfully
  })
}

function saveAllToFile(){
  saveConfigToFile();
  saveUserToFile();
}

function loadConfig(){
  if(saveDir == null){
    getAppDataPath();
  }

  try{
    let rawData = fs.readFileSync(saveDir+'/config.json');
    let parsedData = JSON.parse(rawData);
    Cameras = parsedData.Cameras;
    for (let i = 0; i < cameraCount; i++) {
      Cameras[i].connected = false;
      Cameras[i].connectCount = -3;
    }
  } catch(error){
    console.log("Unable to load Config File");
  }

  try{
    let rawData = fs.readFileSync(saveDir+'/userSettings.json');
    let parsedData = JSON.parse(rawData);
    Gamepad.setThreshold(parsedData.ZeroThreshold);
    Gamepad.setAxeSwap(parsedData.AxeSwap);
    Gamepad.setTiltInvert(parsedData.InvertTilt);
    Gamepad.setMap(parsedData.ButtonMap);
    PTspeed = parsedData.PanSpeed;
    Window.webContents.send('PTslider', PTspeed);
    ZoomSpeed = parsedData.ZoomSpeed;
    Window.webContents.send('ZoomSlider', ZoomSpeed);
  } catch(error){
    console.log("Unable to load User Settings File");
  }

}

//-----------------------------------------------------------------------------
//Error Handelers
function HTTPerror(err, camera){
  switch (err.code) {
    case "ERR_INVALID_URL":
      console.log("Bad URL Camera: "+camera);
      break;
    default:
      console.log(err);
  }
}


//-----------------------------------------------------------------------------
//public functions
exports.init = function(item){
  Window = item;
  Gamepad.init(Window, processPT, processZoom);
  loadConfig();
  GUI_updateSettings();
  setInterval(PTZloop, 130);
  setInterval(connectLoop, 1000);
}

//-----------------------------------------------------------------------------
//Gamepad buttonCallbacks
Gamepad.attachButtonCallback(1,'Select Camera', true,
    selectCamera,
    null);

Gamepad.attachButtonCallback(2,'Recall Preset', true,
    function(index){
      if(!presetRecordMode){
        recallPreset(index);
        Window.webContents.send('blinkPreset', index, false);
      }
      else{
        storePreset(index);
        Window.webContents.send('blinkPreset', index, true);
      }
    },
    null);

Gamepad.attachButtonCallback(3,'Auto Focus', false,
    function(index){setAutoFocus(); Window.webContents.send('blinkAF');},
    null);

Gamepad.attachButtonCallback(4,'Manual Focus', false,
    function(index){setManualFocus(); Window.webContents.send('blinkMF');},
    null);

Gamepad.attachButtonCallback(5,'Focus Near', false,
    function(index){adjustFocus('near');
                            Window.webContents.send('blinkMFnear', true);},
    function(index){adjustFocus('stop');
                            Window.webContents.send('blinkMFnear', false);});

Gamepad.attachButtonCallback(6,'Focus Far', false,
    function(index){adjustFocus('far');
                            Window.webContents.send('blinkMFfar', true);},
    function(index){adjustFocus('stop');
                            Window.webContents.send('blinkMFfar', false);});

Gamepad.attachButtonCallback(7,'Touch Focus', false,
    function(index){setOTAF();  Window.webContents.send('blinkOTAF');},
    null);

Gamepad.attachButtonCallback(8,'Constant Zoom In', true,
    function(index){setConstantZoom(index)}, null);

Gamepad.attachButtonCallback(9,'Constant Zoom Out', true,
    function(index){setConstantZoom(-index)}, null);

Gamepad.attachButtonCallback(10,'Record Mode', false,
    function(){presetRecordMode = true}, function(){presetRecordMode = false});

//-----------------------------------------------------------------------------
//GUI Commands
//Commands that are sent to the renderer process
function GUI_selectCamera(){
  Window.webContents.send('selectCamera', selectedCamera,
                                                Cameras[selectedCamera]);
}

function GUI_connectCamera(index){
  Window.webContents.send('connectCamera', index, Cameras[index]);
}

function GUI_updateSettings(){
  Window.webContents.send('updateSettings', Cameras, selectedCamera, Gamepad.getMap());
}

function GUI_displayLiveValues(){
  Window.webContents.send('displayLiveValues',
                                      Cameras[selectedCamera].liveValues);
  // console.log(Cameras[selectedCamera].liveValues)
}



//-----------------------------------------------------------------------------
//from GUI
//commands received from the renderer process

ipcMain.on('selectCamera', function(event, index){
  selectCamera(index);
})

ipcMain.on('saveSettings', function(event, values){
  for (var i = 0; i < cameraCount; i++) {
    Cameras[i].enabled = values[i].enabled;
    Cameras[i].address = values[i].address;
    if(Cameras[i].address == '0.0.0.0'){Cameras[i].enabled = false}
    if(Cameras[i].enabled == false){Cameras[i].connected = false}
    Cameras[i].port = values[i].port;
  }
  GUI_updateSettings();
  saveAllToFile();
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
  saveUserToFile();
})

ipcMain.on('setZoomSpeed', function(event, value){
  ZoomSpeed = value;
  saveUserToFile();
})

ipcMain.on('clearMap', function(event){
  Gamepad.clearMap();
})

ipcMain.on('clearConfig', function(event){
  for (var i = 0; i < cameraCount; i++) {
    Cameras[i].enabled = false;
    Cameras[i].connected = false;
    Cameras[i].address = '0.0.0.0';
    Cameras[i].port = 80;
  }
  GUI_updateSettings();
})

// ipcMain.on('PanTilt', function(event, pan, tilt){
//   processPT(pan, tilt);
// })
//
// ipcMain.on('Zoom', function(event, value){
//   processZoom(value);
// })
