'use strict';
var board = require('./board');

/**
 * @param numRows number of columns
 * @param numCols optional, defaults to number of rows
 */
exports.generate = function generate(numRows, numCols) {
  if(!numCols) numCols = numRows;
  var available = availableBoard(numRows, numCols);
  var lengths = [];

  /* ... */

  redoCounts(available);
  return board.initBoard(available.row, available.col, lengths);
};

exports.solve = function solve() {
  /* ... */
};

Object.defineProperty(exports, 'units', { value: {} });
exports.units.availableBoard = availableBoard;
exports.units.redoCounts = redoCounts;

// a matrix of booleans
// true: available
// false: taken, cannot place a new piece there
function availableBoard(numRows, numCols) {
  var available = [];
  available.row = [];
  available.col = [];

  var r, c;
  void(c);
  void(numCols);
  for(r=0; r<numRows; r++) {
    var row = [];
    for(c=0; c<numCols; c++) {
      row.push(true);
    }
    available.push(row);
    available.row.push(0);
  }
  for(c=0; c<numCols; c++) {
    available.col.push(0);
  }
  return available;
}

function redoCounts(available) {
  available.row = available.row.map(function() { return 0; });
  available.col = available.col.map(function() { return 0; });

  available.forEach(function(row, r) {
    row.forEach(function(cell, c) {
      if(!cell) {
        available.col[c]++;
        available.row[r]++;
      }
    });
  });
}
