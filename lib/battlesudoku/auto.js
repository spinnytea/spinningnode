'use strict';
var _ = require('lodash');
var board = require('./board');

/**
 * TODO large boards are not interesting
 *  - the 2 I tried weren't but that might just be from low sample size
 *  - test this theory by filling in the board on the UI at the start
 * @param numRows number of columns
 * @param numCols optional, defaults to number of rows
 */
exports.generate = function generate(numRows, numCols) {
  if(!numCols) numCols = numRows;
  var available = availableBoard(numRows, numCols);
  var lengths = [];

  var keepGoing = true;
  while(keepGoing) {
    var next = pickAPiece(available);

    // check and place the piece
    if(next && canPlace(available, next.r, next.c, next.l, next.d)) {
      doPlace(available, next.r, next.c, next.l, next.d);
      lengths.push(next.l);
    } else {
      // TODO when to stop?
      if(lengths.length > 0)
        keepGoing = false;
    }
  }

  lengths.sort().reverse();
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
exports.units.findRowLengths = findRowLengths;
exports.units.findColLengths = findColLengths;
exports.units.findAllLengths = findAllLengths;

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

function pickAPiece(available) {
  // find the spot where we can generate the longest piece
  // basically, find the r,c,l,d where l can be the max size
  var len = _.sample(findAllLengths(available));
  if(!len) return undefined;

  // pick a new random size
  var adjust = _.random(len.l-1);
  // slide l along the dir randomly (so we don't always place it at the top/left)
  var slide = _.random(adjust);

  len.l -= adjust;
  if(len.d) {
    len.c += slide;
  } else {
    len.r += slide;
  }

  return len;
}

function findRowLengths(available, r, size) {
  var max = -1;
  var lengths = [];
  var curr = 0;

  var c;
  for(c=0; c<available[r].length; c++) {
    if(canPlace(available, r, c, 1, 1, true)) {
      // update curr
      if(!size || curr < size)
        curr++;

      // update max
      if(curr === max) {
        lengths.push({
          r: r,
          c: c-curr+1,
          l: curr,
          d: true
        });
      } if(curr > max && (!size || curr === size)) {
        max = curr;
        lengths = [{
          r: r,
          c: c-curr+1,
          l: curr,
          d: true
        }];
      }
    } else {
      // reset curr
      curr = 0;
    }
  }

  return lengths;
}

function findColLengths(available, c, size) {
  var max = -1;
  var lengths = [];
  var curr = 0;

  var r;
  for(r=0; r<available.length; r++) {
    if(canPlace(available, r, c, 1, 1, true)) {
      // update curr
      if(!size || curr < size)
        curr++;

      // update max
      if(curr === max) {
        lengths.push({
          r: r-curr+1,
          c: c,
          l: curr,
          d: false
        });
      } if(curr > max && (!size || curr === size)) {
        max = curr;
        lengths = [{
          r: r-curr+1,
          c: c,
          l: curr,
          d: false
        }];
      }
    } else {
      // reset curr
      curr = 0;
    }
  }

  return lengths;
}

function combine(ret, next) {
  if(!next.length) return ret;
  if(!ret.length) return next;
  if(ret[0].l > next[0].l) return ret;
  if(ret[0].l < next[0].l) return next;
  Array.prototype.push.apply(ret, next);
  return ret;
}
function findAllLengths(available, size) {
  var row = available.map(function(ignore, r) {
    return findRowLengths(available, r, size);
  }).reduce(combine, []);

  var col = available[0].map(function(ignore, c) {
    return findColLengths(available, c, size);
  }).reduce(combine, []);

  return combine(row, col);
}