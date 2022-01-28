// Code written by Faical Ghoul https://instagram.com/faycaldgl
// Inspired by Daniel Shiffman "Traveling Salesperson with Genetic Algorithm"
// and "Earthquake Data visualization"

// GA variables
var cities = [
  { code: "16", coordinates: [36.7538, 3.0588] }, // Alger
  { code: "11", coordinates: [22.7903, 5.5193] }, // Tamanrasset
  { code: "19", coordinates: [36.1898, 5.4108] }, // Setif
  { code: "17", coordinates: [34.6704, 3.2504] }, // Djelfa
  { code: "25", coordinates: [36.365, 6.61472] }, // Constantine
  { code: "01", coordinates: [28.0174, -0.2642] }, // Adrar
  { code: "47", coordinates: [32.4944, 3.6445] }, // Ghardaia
  { code: "37", coordinates: [27.6719, -8.1398] }, // Tindouf
  { code: "32", coordinates: [33.6854, 1.0304] }, // El Bayadh
  { code: "31", coordinates: [35.6987, -0.6349] }, // Oran
  { code: "23", coordinates: [36.9142, 7.7427] }, // Annaba
  // { code: "16", coordinates: [36.7538, 3.0588] }, // Alger
];

var popSize = 100;
var population = [];
var fitness = [];

var recordDistance = Infinity;
var bestEver;
var currentBest;

var statusP;
/////////////////
// Map Variables
var mapimg;

var clat = 28.0339;
var clon = 1.6596;

var ww = 1080;
var hh = 2100;

var zoom = 4;
var earthquakes;
var borders = null;
function preload() {
  // The clon and clat in this url are edited to be in the correct order.
  // mapimg = loadImage(
  //   "https://api.mapbox.com/styles/v1/mapbox/dark-v9/static/" +
  //     clon +
  //     "," +
  //     clat +
  //     "," +
  //     zoom +
  //     "/" +
  //     ww / 2 +
  //     "x" +
  //     hh / 2 +
  //     "@2x?access_token=pk.eyJ1IjoiZGdsY3NnYW1lciIsImEiOiJja3lyaTNtZHMwdGtuMnBtdmR4cDk4ZTl6In0.YcAcBtwnJIroDy8Sb0-RFw"
  // );
  mapimg = loadImage("algeria.png");
  borders = loadJSON("alg-final.geojson");
}
////////////////

async function setup() {
  frameRate(30);
  createCanvas(ww, hh);

  var cx = mercX(clon);
  var cy = mercY(clat);

  // Preparing Wilayas border
  // borders = borders.features;
  // borders = borders.map((wilaya) => wilaya.geometry.coordinates[0]);
  // borders = borders.map((wilaya) => wilaya.map((item) => item.map((step) => createVector(mercX(step[0]) - cx, mercY(step[1]) - cy))));
  borders = borders.features;
  borders = borders.map((wilaya) => {
    return { code: wilaya.properties.ISO, name: wilaya.properties.NAME_1, coordinates: wilaya.geometry.coordinates[0] };
  });
  borders = borders.map((wilaya) => {
    return {
      ...wilaya,
      coordinates: wilaya.coordinates.map((item) => item.map((step) => createVector(mercX(step[0]) - cx, mercY(step[1]) - cy))),
    };
  });
  //

  var order = [];
  for (var i = 0; i < cities.length; i++) {
    var v = createVector(mercX(cities[i].coordinates[1]) - cx, mercY(cities[i].coordinates[0]) - cy);
    cities[i].coordinates = v;
    order[i] = i;
  }

  for (var i = 0; i < popSize; i++) {
    //population[i] = shuffle(order);
    population[i] = order;
  }
  statusP = createP("").style("font-size", "32pt");
}

function fact(n) {
  if (n == 1) {
    return 1;
  } else {
    return n * fact(n - 1);
  }
}

function draw() {
  //background("#1A1A40");
  translate(width / 2, height / 2);
  imageMode(CENTER);
  image(mapimg, 0, 0);

  // GA
  calculateFitness();
  normalizeFitness();
  nextGeneration();

  //Draw Wilayas border
  for (const wilaya of borders) {
    stroke("#1A1A40");
    strokeWeight(10);
    fill("#1A1A40");

    for (const city of cities) {
      if (wilaya.code === city.code) {
        fill("#EDF2EF");
      }
    }

    beginShape();
    for (const item of wilaya.coordinates) {
      for (const step of item) {
        stroke("rgba(255, 100, 100, 1)");
        vertex(step.x, step.y);
      }
    }
    endShape();
  }
  //
  beginShape();
  for (var i = 0; i < bestEver.length; i++) {
    var n = bestEver[i];
    vertex(cities[n].coordinates.x, cities[n].coordinates.y);
    if (i === 0) {
      stroke("#B4F8C8");
    } else if (i === bestEver.length - 1) {
      stroke("red");
    } else {
      stroke(0);
    }
    ellipse(
      cities[n].coordinates.x,
      cities[n].coordinates.y,
      i === 0 || i === bestEver.length - 1 ? 12 : 8,
      i === 0 || i === bestEver.length - 1 ? 12 : 8
    );
    stroke(0);
    // stroke("#57C4E5");
    fill(255, 255, 255);
    strokeWeight(5);
    textSize(24);
    text(borders.find((wilaya) => wilaya.code === cities[n].code).name, cities[n].coordinates.x - 25, cities[n].coordinates.y - 20);
    noFill();
    strokeWeight(7);
    stroke("#57C4E5");
  }
  endShape();
  // statistics
  translate(-(width / 2), -(height / 2));
  stroke("#FA58B6");
  fill(255);
  strokeWeight(1);
  textSize(24);
  textStyle(BOLD);
  text("عدد المدن : " + cities.length, ww / 2, hh - 150);
  var result = fact(cities.length);
  text("(n!) عدد الإحتمالات : " + result, ww / 2 - result.toString().length * 16 - 16, hh - 100);
}
