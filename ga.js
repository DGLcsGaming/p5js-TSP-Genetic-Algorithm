// Code written by Faical Ghoul https://instagram.com/faycaldgl
// Inspired by Daniel Shiffman "Traveling Salesperson with Genetic Algorithm"
// and "Earthquake Data visualization"

function calculateFitness() {
  for (var i = 0; i < population.length; i++) {
    var d = calcDistance(cities, population[i]);
    if (d < recordDistance) {
      recordDistance = d;
      bestEver = population[i];
    }
    fitness[i] = 1 / (pow(d, 8) + 1);
  }
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
    var cityA = points[cityAIndex].coordinates;
    var cityBIndex = order[i + 1];
    var cityB = points[cityBIndex].coordinates;
    var d = dist(cityA.x, cityA.y, cityB.x, cityB.y);
    sum += d;
  }
  return sum;
}

function normalizeFitness() {
  var sum = 0;
  for (var i = 0; i < fitness.length; i++) {
    sum += fitness[i];
  }
  for (var i = 0; i < fitness.length; i++) {
    fitness[i] = fitness[i] / sum;
  }
}

function nextGeneration() {
  var newPopulation = [];
  for (var i = 0; i < population.length; i++) {
    var orderA = pickOne(population, fitness);
    var orderB = pickOne(population, fitness);
    var order = crossOver(orderA, orderB);
    mutate(order, 0.1);
    newPopulation[i] = order;
  }
  population = newPopulation;
}

function pickOne(list, prob) {
  var index = 0;
  var r = random(1);

  while (r > 0) {
    r = r - prob[index];
    index++;
  }
  index--;
  return list[index].slice();
}

function crossOver(orderA, orderB) {
  var start = floor(random(1, orderA.length - 2));
  var end = floor(random(start + 1, orderA.length - 2));
  var neworder = [0];
  neworder.push(...orderA.slice(start, end));
  for (var i = 1; i < orderB.length - 1; i++) {
    var city = orderB[i];
    if (!neworder.includes(city)) {
      neworder.push(city);
    }
  }
  neworder.push(orderA.length - 1);
  return neworder;
}

function mutate(order, mutationRate) {
  for (var i = 1; i < cities.length - 1; i++) {
    if (random(1) < mutationRate) {
      var indexA = floor(random(1, order.length - 2));
      var indexB = (indexA + 1) % cities.length;
      swap(order, indexA, indexB);
    }
  }
}
