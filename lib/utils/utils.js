'use strict';

exports.randInt = randInt;
exports.randElem = randElem;
exports.shuffle = shuffle;
exports.distance = distance;
exports.interpolate = interpolate;
exports.interpolateColor = interpolateColor;
exports.clamp = clamp;
exports.wrap = wrap;


function randInt(limit) {
  return Math.floor(Math.random() * limit);
}

// return a random element from the array
function randElem(array) {
  return array[randInt(array.length)];
}

// randomizes the order of the array
// modifies the array in place
// returns the array for chaining
function shuffle(array) {
  var copy = array.splice(0);
  while(copy.length)
    array.push(copy.splice(randInt(copy.length), 1)[0]);
  return array;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
}

function interpolate(percent, a, b) {
  var min = Math.min(a, b);
  var max = Math.max(a, b);
  return Math.min(max, Math.max(min, ((max-min)*percent)+min));
}

function interpolateColor(percent, r1, g1, b1, r2, g2, b2) {
  return 'rgb(' +
    Math.floor(interpolate(percent, r1, r2)) +
    Math.floor(interpolate(percent, g1, g2)) +
    Math.floor(interpolate(percent, b1, b2)) +
    ')';
}

function clamp(min, val, max) {
  return Math.min(max, Math.max(min, val));
}
function wrap(min, val, max) {
  if(val < min) return val + (max-min);
  if(val > max) return val - (max-min);
  return val;
}
