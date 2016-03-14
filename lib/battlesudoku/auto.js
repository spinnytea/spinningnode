'use strict';
var _ = require('lodash');
var board = require('./board');

/**
 * @param numRows number of columns
 * @param numCols optional, defaults to number of rows
 */
exports.generate = function generate(numRows, numCols) {
  if(!numCols) numCols = numRows;
  var available = availableBoard(numRows, numCols);
  var lengths = [];

  var keepGoing = true;
  var papState = initPapState(numRows, numCols, available);
  while(keepGoing) {
    var next = pickAPiece(papState);

    // check and place the piece
    if(canPlace(available, next.r, next.c, next.l, next.d)) {
      doPlace(available, next.r, next.c, next.l, next.d);
      lengths.push(next.l);
    } else {
      // TODO when to stop?
      if(lengths.length > 0)
        keepGoing = false;
    }
  }

  var counts = getCounts(available);
  return board.initBoard(counts.row, counts.col, lengths);
};

exports.solve = function solve() {
  /* ... */
};

Object.defineProperty(exports, 'units', { value: {} });
exports.units.availableBoard = availableBoard;
exports.units.getCounts = getCounts;
exports.units.canPlace = canPlace;
exports.units.doPlace = doPlace;
exports.units.pickAPiece = pickAPiece;

// a matrix of booleans
// true: available
// false: taken, cannot place a new piece there
function availableBoard(numRows, numCols) {
  var available = [];

  var r, c;
  for(r=0; r<numRows; r++) {
    var row = [];
    for(c=0; c<numCols; c++) {
      row.push(true);
    }
    available.push(row);
  }

  return available;
}

function getCounts(available) {
  function zero() { return 0; }
  var counts = { row: available.map(zero), col: available[0].map(zero) };

  available.forEach(function(row, r) {
    row.forEach(function(cell, c) {
      if(!cell) {
        counts.row[r]++;
        counts.col[c]++;
      }
    });
  });

  return counts;
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

function initPapState(numRows, numCols, available) {
  void(available);
  return {
    numRows: numRows,
    numCols: numCols,
    maxSize: Math.max(numRows, numCols)
  };
}
function pickAPiece(papState) {
  var dir = Math.random() < 0.5; // TODO pick dir based on row/col that allows for the max size
  var size = _.random(papState.maxSize-1)+1; // TODO pick max size based on what we can do in that direction (still have randomness)
  var row = 0; // TODO bias the row/col to where the piece to fits?
  var col = 0;

  if(dir) {
    row = _.random(papState.numRows);
    col = _.random(papState.numCols-size);
  } else {
    row = _.random(papState.numRows-size);
    col = _.random(papState.numCols);
  }

  return { r: row, c: col, l: size, d: dir };
}
