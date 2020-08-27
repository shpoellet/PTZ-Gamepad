//Camera.js
//
//Defines the class Camera
//
//Last Edited By: Shawn Poellet 4-7-2019

'use strict'

// const types = require('./types.js');

module.exports = class Camera {
  constructor(){
    this.enabled = false;
    this.connected = false;
    this.connectCount = 0;
    // this.address = null;
    // this.port = 80;
    this.address = 'pac001-gateway.gbpac.uni.edu';
    this.port = 82;

    this.pan = 50;
    this.tilt  = 50;
    this.zoom  = 50;
    this.sentPan  = 50;
    this.sentTilt  = 50;
    this.sentZoom  = 50;

    var liveValues = {
      autoFocus: false
    };

    this.liveValues = liveValues;
  }
}
