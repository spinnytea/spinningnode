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
exports.units.canPlace = canPlace;
exports.units.doPlace = doPlace;

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

/**
 * @param a available
 * @param r row start
 * @param c col start
 * @param l length
 * @param d direction (bool, true: right, false: down)
 */
function canPlace(a, r, c, l, d) {
  var ri = r;
  var ci = c;
  var rf = r + (d?0:l-1);
  var cf = c + (d?l-1:0);

  // the piece must always be on the board
  if(ri < 0 || rf >= a.length) return false;
  if(ci < 0 || cf >= a[0].length) return false;

  // check the whole area to make sure we can place the piece
  for(r=ri-1; r<=rf+1; r++)
    for(c=ci-1; c<=cf+1; c++)
      if((r in a) && (c in a[r]) && !a[r][c])
        return false;

  return true;
}
function doPlace(a, r, c, l, d) {
  var i;
  if(d) {
    for(i=0; i<l; i++)
      a[r][c+i] = false;
  } else {
    for(i=0; i<l; i++)
      a[r+i][c] = false;
  }
}
