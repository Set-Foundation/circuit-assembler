// SET Conference 21 Model

//// CONFIG
var SQ_SIZE = 20; // size of circles
var buildCoords = [
  [ 900,  500],
  [ 680,   50],
  [ 520,  230],
  [1000,  100],
  [ 100,  120],
  [ 520,  520],
  [ 850,  100],
  [ 810,   40],
  [ 580,  200],
  [ 310,  120]];
  
  var turbineCoords = [
    [200, 500]
  ];
  // ADDING MORE THAN ONE TURBINE BREAKS IT BECAUSE YOU CAN CONNECT TO ALTERNATING PLANTS
//// CONFIG

var canvas; // canvas itself
var ctx; // context for canvas
var buildings = Array();  // buildings
var turbines = Array();   // turbines
var currSelected; // currently selected building/turbine

class Building {
  constructor(px, py, num) {
    this.type = "Building";
    this.px = px;
    this.py = py;
    this.connectsTo = null;
    this.connectedFrom = null;
    this.num = num
  }

  draw() {

    if (currSelected == this) ctx.strokeStyle = "green";
    else ctx.strokeStyle = "black";

    ctx.beginPath();
    ctx.arc(this.px, this.py, SQ_SIZE, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillText(this.num, this.px, this.py - 1.5 * SQ_SIZE);

    if (this.connectsTo) {
      ctx.beginPath();
      ctx.moveTo(this.px, this.py);
      ctx.lineTo(this.connectsTo.px, this.connectsTo.py);
      ctx.stroke();
    }
  }

  click() {
    if (!currSelected) currSelected = this;
    // if nothing selected, select this

    else if (currSelected == this) currSelected = null;
    // clicking again deselects

    else {

      if (currSelected.type == "Building")
        currSelected.connectsTo = this;
      // Establish the connection to the target

      else if (currSelected.type == "Turbine")
        currSelected.connectsTo.push(this);

      if (this.connectedFrom && this.connectedFrom.type == "Building" && this.connectedFrom != currSelected) {
        // PREVENT MORE THAN ONE INCOMING CONNECTION
        this.connectedFrom.connectsTo = null;
        // break links with existing connections
      }

      else if (this.connectedFrom && this.connectedFrom.type == "Turbine" && this.connectedFrom != currSelected) {
        // PREVENT MORE THAN ONE INCOMING CONNECTION
        this.connectedFrom.connectsTo.splice(this.connectedFrom.connectsTo.indexOf(this), 1);
        // break links with existing connections
      }

      this.connectedFrom = currSelected; // marks connection for reference
      currSelected = this;
      
    }
  }
}

class Turbine {
  constructor(px, py, num) {
    this.type = "Turbine";
    this.px = px;
    this.py = py;
    this.connectsTo = [];
    this.num = num
  }

  draw() {

    if (currSelected == this) ctx.strokeStyle = "blue";
    else ctx.strokeStyle = "purple";

    ctx.beginPath();
    ctx.arc(this.px, this.py, SQ_SIZE, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillText(this.num, this.px, this.py - 1.5 * SQ_SIZE);

    for (var i=0; i < this.connectsTo.length; i++) {
      ctx.beginPath();
      ctx.moveTo(this.px, this.py);
      ctx.lineTo(this.connectsTo[i].px, this.connectsTo[i].py);
      ctx.stroke();
    }
  }

  click() {
    if (!currSelected) currSelected = this;
    // if nothing selected, select this

    else if (currSelected == this) currSelected = null;
    // clicking again deselects

    else if (currSelected.type == "Building") {
      currSelected.connectsTo = this;
      // Establish the connection to the target
      currSelected = this;
    }
  }
}

function initialize() {

    gamediv = document.getElementById("circuit");

    document.addEventListener("click", mouseClicked); // add event
    setInterval(draw, 20); // draw

    canvas = document.createElement("canvas")

    canvas.width = gamediv.offsetWidth - 30; // minus padding
    canvas.height = canvas.width * 3/5;

    gamediv.appendChild(canvas);// put the canvas into our document

    ctx = canvas.getContext("2d"); // sets the ctx variable

    ctx.lineWidth = 3;

    var  b_count = 0; // total building + turbines count

    for (var i=0; i<turbineCoords.length; i++) {
      turbines.push(new Turbine(turbineCoords[i][0], turbineCoords[i][1], b_count++));
      // add new turbines
    }

    for (var i=0; i<buildCoords.length; i++) {
      buildings.push(new Building(buildCoords[i][0], buildCoords[i][1], b_count++));
      // add new buildings
    }

}


function mouseClicked(e) {
  var mX = e.clientX - canvas.offsetLeft + window.scrollX;
  var mY = e.clientY - canvas.offsetTop + window.scrollY;

  for (var i=0; i < buildings.length; i++) {
    if ((mX-buildings[i].px)**2 + (mY-buildings[i].py)**2 < SQ_SIZE**2) {
      buildings[i].click();
      generateADJ();
      return
    }
  }

  for (var i=0; i < turbines.length; i++) {
    if ((mX-turbines[i].px)**2 + (mY-turbines[i].py)**2 < SQ_SIZE**2) {
      turbines[i].click();
      generateADJ();
      return
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clears the canvas for redraw
  for (var i=0; i < buildings.length; i++) {
    buildings[i].draw();
  }

  for (var i=0; i < turbines.length; i++) {
    turbines[i].draw();
  }
  
}

function generateADJ() {
  // generates adjacency list

  var connections = {};
  var fullyconn = true;

  // CHECK BUILDINGS
  for (var i=0; i < buildings.length; i++) {
    if (buildings[i].connectsTo) {
      connections[buildings[i].num] = [buildings[i].connectsTo.num]
    }
    else {
      connections[buildings[i].num] = "none";
      fullyconn = false;
    }
  }

  // CHECK TURBINES
  for (var i=0; i < turbines.length; i++) {
    if (turbines[i].connectsTo) {

      var adjs = [];
      for (var j=0; j < turbines[i].connectsTo.length; j++) {
        adjs.push(turbines[i].connectsTo[j].num);
      }
      connections[turbines[i].num] = adjs;

    }
    else {
      connections[turbines[i].num] = "none";
      fullyconn = false;
    }
  }

  fieldNameElement = document.getElementById("print")
  fieldNameElement.textContent = JSON.stringify(connections);

  if (fullyconn) {
    fieldNameElement.textContent += " Ready to GO!"
  }
  else {
    fieldNameElement.textContent += " NOT FULLY CONNECTED!"
  }
}