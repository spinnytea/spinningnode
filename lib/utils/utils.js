'use strict';

exports.randInt = function randInt(limit) {
  return Math.floor(Math.random() * limit);
};

// return a random element from the array
exports.randElem = function randElem(array) {
  return array[randInt(array.length)];
};

// randomizes the order of the array
// modifies the array in place
// returns the array for chaining
exports.shuffle = function shuffle(array) {
  var temp = [];
  Array.prototype.push.apply(temp, array);
  array.splice(0);
  while(temp.length > 0)
    array.push(temp.splice(randInt(temp.length), 1)[0]);
  return array;
};

exports.distance = function distance(x1, y1, x2, y2) {
  return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
};

exports.interpolate = function interpolate(percent, a, b) {
  var min = Math.min(a, b);
  var max = Math.max(a, b);
  return Math.min(max, Math.max(min, ((max-min)*percent)+min));
};

exports.interpolateColor = function interpolateColor(percent, r1, g1, b1, r2, g2, b2) {
  return 'rgb(' +
    Math.floor(interpolate(percent, r1, r2)) +
    Math.floor(interpolate(percent, g1, g2)) +
    Math.floor(interpolate(percent, b1, b2)) +
    ')';
};