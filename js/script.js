var canvas = null;
var context = null;
var k = 0.96;
var circles = [];
var curr_index = null;
var dragndrop = false;
var startX = 0;
var startY = 0;
var startTime = null;

class circle {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.r = "00";
    this.g = "00";
    this.b = "00";
    this.rad = 0;
    this.notmove = false;
    this.onfloor = false;
  }
  move() {
      this.x = this.x + this.vx;
      this.y = this.y + this.vy;
  }
  check_collision() {
    if ((this.x - this.rad <= 0) || (this.y - this.rad <= canvas.height / 3) || (this.y + this.rad >= canvas.height) || (this.x + this.rad >= canvas.width)) {
      if (this.x - this.rad <= 0) {
        this.vx = -this.vx;
        this.x = this.rad;
      }
      if (this.y - this.rad <= canvas.height / 3) {
        this.vy = -this.vy;
        this.y = canvas.height / 3 + this.rad;
      }
      if (this.y + this.rad >= canvas.height) {
        this.vy = -this.vy;
        this.y = canvas.height - this.rad;
      }
      if (this.x + this.rad >= canvas.width) {
        this.vx = -this.vx;
        this.x = canvas.width - this.rad;
      }
    }
  }
  draw() {
    context.beginPath();
    context.fillStyle = "#"+this.r+this.g+this.b;
    context.arc(this.x, this.y, this.rad, 0, 2*Math.PI);
    context.fill();
  }

  check_collision_circles() {
    for (var i = 0; i < circles.length; i++) {
      if (this != circles[i]) {
        var cent_to_cent = Math.sqrt(Math.pow((this.x - circles[i].x), 2) + Math.pow((this.y - circles[i].y), 2));
        if (cent_to_cent <= (this.rad + circles[i].rad) && (!circles[i].notmove && !this.notmove)) {

          var newVX = this.vx;
          var newVY = this.vy;

          this.vx = circles[i].vx - this.vx;
          this.vy = circles[i].vy - this.vy;

          if (this.vx == 0) this.vx = 5;
          if (this.vy == 0) this.vy = 5;

          if (Math.abs(this.vx) > 5)
            this.vx = 5*(Math.abs(this.vx) / this.vx);
          if (Math.abs(this.vy) > 5)
            this.vy = 5*(Math.abs(this.vy) / this.vy);

          circles[i].vx = newVX - circles[i].vx;
          circles[i].vy = newVY - circles[i].vy;

          if (circles[i].vx == 0) circles[i].vx = -this.vx;
          if (circles[i].vy == 0) circles[i].vy = -this.vx;

          if (Math.abs(circles[i].vx) > 5)
            circles[i].vx = 5*(Math.abs(circles[i].vx) / circles[i].vx);
          if (Math.abs(circles[i].vy) > 5)
            circles[i].vy = 5*(Math.abs(circles[i].vy) / circles[i].vy);

          var drad = this.rad + circles[i].rad - cent_to_cent;
          var dx = drad * this.vx / Math.sqrt(this.vx * this.vx + this.vy * this.vy) + 2;
          var dy = drad * this.vy / Math.sqrt(this.vx * this.vx + this.vy * this.vy) + 2;

          this.x = this.x + this.vx + (dx * (this.vx / Math.abs(this.vx)) / 2);
          this.y = this.y + this.vy + (dy * (this.vy / Math.abs(this.vy)) / 2);

          circles[i].x = circles[i].x + (dx * (circles[i].vx / Math.abs(circles[i].vx)) / 2);
          circles[i].y = circles[i].y + (dy * (circles[i].vy / Math.abs(circles[i].vy)) / 2);

        }
      }
    }
  }
}

$(document).ready(function() {
  $(window).on("beforeunload", function() {
    sessionStorage['circle_count'] = circles.length;
    var cookie_srting = "";
    for (var i = 0; i < circles.length; i++) {
      cookie_srting = cookie_srting +circles[i].x+"/"+circles[i].y+"/"+circles[i].vx+"/"+circles[i].vy+"/"+circles[i].rad+"/"+circles[i].r+"/"+circles[i].g+"/"+circles[i].b+";";
    }

    sessionStorage['circles'] = cookie_srting;
  });

  canvas = document.getElementById('canvas');
  context = canvas.getContext('2d');

  var cookie = document.cookie;
  var count = Number(sessionStorage['circle_count']);

  var circles_string = sessionStorage['circles'];

  if (circles_string != undefined) {
    circles_string = sessionStorage['circles'].split(";");

    for (var i = 0; i < count; i++) {
      var params = circles_string[i].split("/");
      var temp_circle = new circle();
      temp_circle.x = Number(params[0]);
      temp_circle.y = Number(params[1]);
      temp_circle.vx = Number(params[2]);
      temp_circle.vy = Number(params[3]);
      temp_circle.rad = Number(params[4]);
      temp_circle.r = params[5];
      temp_circle.g = params[6];
      temp_circle.b = params[7];

      circles.splice(i, 1, temp_circle);
    }
  }

  $(canvas).on("touchstart mousedown", function(e) {
      cir_clicked(e);
  });
  $(canvas).on("touchend mouseup", function(e) {
    cir_released(e);
  });

  setInterval(drawScene, 30);
});

function drawScene() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  context.beginPath();
  context.moveTo(0, canvas.height / 3);
  context.lineTo(canvas.width, canvas.height / 3);
  context.stroke();

  for (var i = 0; i < circles.length; i++) {

    if (circles[i].y > canvas.height / 3 && !circles[i].notmove) {
      circles[i].check_collision();
      circles[i].check_collision_circles();
      circles[i].move();
    }
  }

  for (var i = 0; i < circles.length; i++) {
    circles[i].draw();
  }
}

function cir_clicked(e) {
  startX = e.pageX;
  startY = e.pageY;
  if (e.pageX == undefined) {
    startX = e.originalEvent.touches[0].pageX;
    startY = e.originalEvent.touches[0].pageY;
  }
  for (var i = 0; i < circles.length; i++) {
    if ((startX >= circles[i].x - circles[i].rad) && (startY >= circles[i].y - circles[i].rad) && (startX <= circles[i].x + circles[i].rad) && (startY <= circles[i].y + circles[i].rad)) {
      curr_index = i;
      startTime = new Date();
      $(canvas).on("touchmove mousemove", function(e) {
        if (curr_index != null) {
          if (e.pageX == undefined) {
            circles[curr_index].x = e.originalEvent.touches[0].pageX;
            circles[curr_index].y = e.originalEvent.touches[0].pageY;
          }
          else {
            circles[curr_index].x = e.pageX;
            circles[curr_index].y = e.pageY;
          }

          if (circles[curr_index].y == Math.ceil(canvas.height / 3)) {
            startX = e.pageX;
            startY = e.pageY;
            if (e.pageX == undefined) {
              startX = e.originalEvent.touches[0].pageX;
              startY = e.originalEvent.touches[0].pageY;
            }
          }
          circles[curr_index].notmove = true;
        }
      });
      break;
    }
    else {
      curr_index = null;
    }
  }
}
function cir_released(e) {
  if (curr_index != null) {
    circles[curr_index].notmove = false;
    var difX = 0;
    var difY = 0;
    if (e.pageX == undefined) {
      difX = e.originalEvent.changedTouches[0].pageX - startX;
      difY = e.originalEvent.changedTouches[0].pageY - startY;
    }
    else {
      difX = e.pageX - startX;
      difY = e.pageY - startY;
    }
    var difTime = (new Date() - startTime);

    var newVX = difX / (difTime / 50);
    var newVY = difY / (difTime / 50);

    if (Math.abs(newVX) > 3) newVX = 3*(Math.abs(newVX) / newVX);
    if (Math.abs(newVY) > 3) newVY = 3*(Math.abs(newVY) / newVY);

    circles[curr_index].vx = newVX;
    circles[curr_index].vy = newVY;
    $(canvas).unbind("mousemove");
  }
}

function spawn_circle() {
  if (circles.length < 6) {
    var cir = new circle();
    cir.x = getRandomArbitrary(30, canvas.width - 30);
    cir.y = getRandomArbitrary(30, canvas.height / 3 - 30);
    cir.vx = getRandomArbitrary(-5, 5);
    cir.vy = getRandomArbitrary(-5, 5);

    cir.r = decimalToHex(getRandomArbitrary(0, 255));
    cir.g = decimalToHex(getRandomArbitrary(0, 255));
    cir.b = decimalToHex(getRandomArbitrary(0, 255));

    cir.rad = getRandomArbitrary(15, 20);

    circles.splice(0, 0, cir);
  }
}
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
function decimalToHex(d) {
    return  ("0"+(Number(d).toString(16))).slice(-2).toUpperCase()
}
