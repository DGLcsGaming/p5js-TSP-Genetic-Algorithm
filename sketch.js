// Code written by Faical Ghoul https://instagram.com/faycaldgl
// Inspired by Daniel Shiffman "Traveling Salesperson with Genetic Algorithm"
// and "Earthquake Data visualization"

// GA variables
var cities = [
  [36.7538, 3.0588], // Alger
  [22.7903, 5.5193], // Tamanrasset
  [36.1898, 5.4108], // Setif
  [36.9142, 7.7427], // Annaba
  [34.6704, 3.2504], // Djelfa
  [36.365, 6.61472], // Constantine
  [28.0174, -0.2642], // Adrar
  [32.4944, 3.6445], // Ghardaia
  [27.6719, -8.1398], // Tindouf
  [33.6854, 1.0304], // El Bayadh
];

var popSize = 300;
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

var constantine_lat = 36.365;
var constantine_lon = 6.61472;

var ww = 1080;
var hh = 2100;

var zoom = 4;
var earthquakes;
var borders = null;
function preload() {
  // The clon and clat in this url are edited to be in the correct order.
  mapimg = loadImage(
    "https://api.mapbox.com/styles/v1/mapbox/dark-v9/static/" +
      clon +
      "," +
      clat +
      "," +
      zoom +
      "/" +
      ww / 2 +
      "x" +
      hh / 2 +
      "@2x?access_token=pk.eyJ1IjoiZGdsY3NnYW1lciIsImEiOiJja3lyaTNtZHMwdGtuMnBtdmR4cDk4ZTl6In0.YcAcBtwnJIroDy8Sb0-RFw"
  );
  // borders = loadJSON("all-wilayas.geojson");
  borders = loadJSON("alg-final.geojson");
}
////////////////

async function setup() {
  frameRate(60);
  createCanvas(ww, hh);

  var cx = mercX(clon);
  var cy = mercY(clat);

  // Drawing Algeria border
  algeriaBorders = algeriaBorders.map((step) => createVector(mercX(step[0]) - cx, mercY(step[1]) - cy));
  // Preparing Wilayas border
  borders = borders.features;
  borders = borders.map((wilaya) => wilaya.geometry.coordinates[0]);
  console.log(borders);
  borders = borders.map((wilaya) => wilaya.map((item) => item.map((step) => createVector(mercX(step[0]) - cx, mercY(step[1]) - cy))));
  console.log(borders);
  //

  var order = [];
  for (var i = 0; i < cities.length; i++) {
    var v = createVector(mercX(cities[i][1]) - cx, mercY(cities[i][0]) - cy);
    cities[i] = v;
    order[i] = i;
  }
  console.log(cities);

  for (var i = 0; i < popSize; i++) {
    // population[i] = shuffle(order);
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

  //Draw Algeria border

  // stroke("#1A1A40");
  // strokeWeight(1);
  // noFill();
  // beginShape();
  // for (const step of algeriaBorders) {
  //   stroke("#FF6464");
  //   vertex(step.x, step.y);
  // }
  // endShape();

  //Draw Wilayas border
  for (const wilaya of borders) {
    stroke("#1A1A40");
    strokeWeight(1);
    fill("#1A1A40");
    // let rand = random();
    // if (rand > 0.95) {
    //   fill("#FAEEE7");
    // }

    beginShape();

    for (const item of wilaya) {
      for (const step of item) {
        stroke("#FF6464");
        vertex(step.x, step.y);
      }
    }

    endShape();
  }
  //
  stroke("#1A1A40");
  strokeWeight(4);
  noFill();
  beginShape();
  for (var i = 0; i < bestEver.length; i++) {
    stroke("#FA58B6");
    var n = bestEver[i];
    vertex(cities[n].x, cities[n].y);
    ellipse(cities[n].x, cities[n].y, 12, 12);
    stroke(255);
    ellipse(cities[n].x, cities[n].y, 4, 4);
    stroke("#FA58B6");
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

function swap(a, i, j) {
  var temp = a[i];
  a[i] = a[j];
  a[j] = temp;
}

function calcDistance(points, order) {
  var sum = 0;
  for (var i = 0; i < order.length - 1; i++) {
    var cityAIndex = order[i];
    var cityA = points[cityAIndex];
    var cityBIndex = order[i + 1];
    var cityB = points[cityBIndex];
    var d = dist(cityA.x, cityA.y, cityB.x, cityB.y);
    sum += d;
  }
  return sum;
}
