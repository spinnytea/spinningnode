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
  var dir = false;
  while(keepGoing) {
    dir = !dir;
    var next = pickALength(available, dir);

    // check and place the length
    if(next && canPlace(available, next.r, next.c, next.l, next.d)) {
      doPlace(available, next.r, next.c, next.l, next.d);
      lengths.push(next.l);
    } else {
      // TODO when to stop?
      if(lengths.length > 0)
        keepGoing = false;
    }
  }

  lengths = _.sortBy(lengths, function(l) { return +l; }).reverse();
  var counts = getCounts(available);
  return board.initBoard(counts.row, counts.col, lengths);
};

/**
 * @param b a board
 */
exports.solve = function solve(b, Promise, notify) {
  // convert to auto-language (available, lengths, counts)
  var available = availableBoard(b);
  var lengths = _.map(b.len.filter(function(l) { return !l.done; }), 'size').sort();
  var counts = {
    row: b.row.map(function(r) { return r.total - r.count; }),
    col: b.col.map(function(c) { return c.total - c.count; }),
  };

  // find solution
  return recursiveSolve(available, lengths, counts, Promise, notify).then(function(result) {
    updateBoard(result, b, true);
  }, function() {
    // consume the error but keep the rejection
    return Promise.reject();
  });
};

Object.defineProperty(exports, 'units', { value: {} });
exports.units.availableBoard = availableBoard;
exports.units.getCounts = getCounts;
exports.units.canPlace = canPlace;
exports.units.doPlace = doPlace;
exports.units.pickALength = pickALength;
exports.units.findRowLengths = findRowLengths;
exports.units.findColLengths = findColLengths;
exports.units.findAllLengths = findAllLengths;
exports.units.findAvailableLengths = findAvailableLengths;
exports.units.recursiveSolve = recursiveSolve;
exports.units.updateRecursiveCounts = updateRecursiveCounts;
exports.units.updateBoard = updateBoard;

// a matrix of booleans
// true: available
// false: taken, cannot mark a new cell there
function availableBoard(numRows, numCols) {
  var available;

  if(numRows.hasOwnProperty('row')) {
    // numRows is actually a board
    available = numRows.map(function(r) {
      return r.map(function(c) {
        return c.state;
      });
    });

  } else {
    available = [];
    var r, c;
    for(r=0; r<numRows; r++) {
      var row = [];
      for(c=0; c<numCols; c++) {
        row.push('none');
      }
      available.push(row);
    }
  }

  return available;
}

function zero() { return 0; }
function getCounts(available) {
  var counts = { row: available.map(zero), col: available[0].map(zero) };

  available.forEach(function(row, r) {
    row.forEach(function(cell, c) {
      if(cell === 'fill') {
        counts.row[r]++;
        counts.col[c]++;
      }
    });
  });

  return counts;
}

/**
 * XXX canPlace is over-engineered if we only need to check a 1x1 (3x3 grid)
 * - it was designed to double check if a whole length could be placed
 * - but the algorithms we use only find possible lengths
 * - so we only check individual cells and just "know" that the whole length is possible
 *
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

  // the length must always be on the board
  if(ri < 0 || rf >= a.length) return false;
  if(ci < 0 || cf >= a[0].length) return false;

  // check the whole area to make sure we can place the length
  for(r=ri-1; r<=rf+1; r++)
    for(c=ci-1; c<=cf+1; c++)
      if((r in a) && (c in a[r]) && a[r][c] === 'fill')
        return false;

  for(r=ri; r<=rf; r++)
    for(c=ci; c<=cf; c++)
      if((r in a) && (c in a[r]) && a[r][c] !== 'none')
        return false;

  return true;
}
function doPlace(a, r, c, l, d) {
  var i;
  if(d) {
    for(i=0; i<l; i++)
      a[r][c+i] = 'fill';
  } else {
    for(i=0; i<l; i++)
      a[r+i][c] = 'fill';
  }
}

function pickALength(available, dir) {
  // find the spot where we can generate the longest length
  // basically, find the r,c,l,d where l can be the max size
  var len = _.sample(findAllLengths(available, dir));
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

/**
 * find lengths on the given row
 *
 * if size is NOT specified, will only return the longest lengths
 * if size is specified, it will return all the lengths of that size exactly
 * if colCounts is specified, will only return lengths that don't violate the counts
 */
function findRowLengths(available, r, size, colCounts) {
  var max = -1;
  var lengths = [];
  var curr = 0;

  var c;
  for(c=0; c<available[r].length; c++) {
    if(canPlace(available, r, c, 1, 1, true) && (!colCounts || colCounts[c] > 0)) {
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

/**
 * find lengths on the given col
 *
 * if size is NOT specified, will only return the longest lengths
 * if size is specified, it will return all the lengths of that size exactly
 * if rowCounts is specified, will only return lengths that don't violate the counts
 */
function findColLengths(available, c, size, rowCounts) {
  var max = -1;
  var lengths = [];
  var curr = 0;

  var r;
  for(r=0; r<available.length; r++) {
    if(canPlace(available, r, c, 1, 1, true) && (!rowCounts || rowCounts[r] > 0)) {
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
function findAllLengths(available, dir) {
  if(dir) {
    return available.map(function(ignore, r) {
      return findRowLengths(available, r);
    }).reduce(combine, []);
  } else {
    return available[0].map(function(ignore, c) {
      return findColLengths(available, c);
    }).reduce(combine, []);
  }
}
function findAvailableLengths(available, size, counts) {
  var row = _.flatten(_.filter(counts.row.map(function(count, r) {
    if(count >= size)
      return findRowLengths(available, r, size, counts.col);
    return undefined;
  })));

  var col = _.flatten(_.filter(counts.col.map(function(count, c) {
    if(count >= size)
      return findColLengths(available, c, size, counts.row);
    return undefined;
  })));

  return combine(row, col);
}

// naive approach
// - list out possible moves for the largest length
//   - use counts to limit the rows/cols we search
//   - add optional param "counts" to findRow/ColLengths
// - loop over the list: place it, recurse
// - if we fail, bubble the failure up
//   - this needs to continue until it's the first loop of the particular length
//   - i.e. if there is [4, 1, 1, 1, 1, 1], and we fail on a '1', we need to stop assessing all but the first '1'
function recursiveSolve(available, lengths, counts, Promise, notify, prevL) {
  if(notify && !_.isFunction(notify)) throw new Error('notify must be a function');
  if(!_.isUndefined(prevL) && !_.isNumber(prevL)) throw new Error('prevL must be a number');

  if(lengths.length === 0)
    return Promise.resolve(available);
  var l = lengths.pop();
  var possible = findAvailableLengths(available, l, counts);
  if(possible.length === 0) {
    if(notify) notify(available);
    return Promise.reject(l);
  }

  // start with a failed promise
  // keep going while the Promises are rejected
  // once we find a successful promise, then that will be returned
  return possible.reduce(function(prev, p, idx, array) {
    return prev.catch(function(errL) {
      if(l === prevL && l === errL) {
        // if this isn't the first of this class of lengths,
        // then bubble the error up
        return Promise.reject(l);
      }

      // if this is the last iteration (or only)
      // then we don't need to copy the data structures
      var isLast = (idx === array.length-1);

      // update available
      var a = isLast?available:_.cloneDeep(available);
      doPlace(a, p.r, p.c, p.l, p.d);

      // update counts
      var c = isLast?counts:_.cloneDeep(counts);
      updateRecursiveCounts(c, p);

      // copy lengths
      var lens = isLast?lengths:_.cloneDeep(lengths);

      if(notify) {
        // recurse (async)
        return new Promise(function(resolve, reject) {
          setTimeout(function() {
            recursiveSolve(a, lens, c, Promise, notify, l).then(resolve, reject);
          });
        });
      } else {
        // recurse (inline)
        return recursiveSolve(a, lens, c, Promise, notify, l);
      }
    });
  }, new Promise(function(a, b) { b(); }));
}

function updateRecursiveCounts(c, p) {
  var i;
  if(p.d) {
    c.row[p.r] -= p.l;
    for(i=0; i<p.l; i++)
      c.col[p.c+i]--;
  } else {
    c.col[p.c] -= p.l;
    for(i=0; i<p.l; i++)
      c.row[p.r+i]--;
  }
  return c;
}

function updateBoard(a, b, fillEmpty) {
  // apply available to the board
  a.forEach(function(row, r) {
    row.forEach(function(cell, c) {
      if(fillEmpty) {
        b[r][c].state = (cell==='fill'?'fill':'empty');
      } else {
        b[r][c].state = cell;
      }
    });
  });
}
