'use strict';
var _ = require('lodash');
var board = require('./board');

/**
 * XXX sometimes a generated board cannot be solved by the solver
 *  - save the fill/empty flags so we can double check it
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

  var hints = [];
  var hintCount = Math.ceil((numRows+numCols)/4); // half the average
  while(hints.length < hintCount) {
    var h = { r: _.random(numRows-1), c: _.random(numCols-1) };
    h.state = (available[h.r][h.c]==='fill'?'fill':'empty');
    if(!hints.some(function(h2) { return h2.r === h.r && h2.c === h.c; }))
      hints.push(h);
  }

  lengths = _.sortBy(lengths, function(l) { return +l; }).reverse();
  var counts = getCounts(available);
  return board.initBoard(counts.row, counts.col, lengths, hints);
};

/**
 * TODO mark borders empty
 * - if there aren't enough 'none' cells, to fill up the count, then we need to exit early
 * - if there are exactly enough empty cells, then we need to place a piece or bust
 * - $scope.board = board.initBoard([3,2,2,6,0,4,2,8,2,3,2,2,5,1], [3,2,6,2,3,4,2,0,2,0,4,3,5,6], [5,5,4,4,4,3,3,3,3,2,2,1,1,1,1]);
 *
 * @param b a board
 */
exports.solve = function solve(b, Promise, notify) {
  // convert to auto-language (available, lengths, counts)
  var available = availableBoard(b);
  var lengths = _.map(b.len, 'size');
  var counts = {
    row: b.row.map(function(r) { return r.total; }),
    col: b.col.map(function(c) { return c.total; }),
  };

  // find solution
  return recursiveMust(available, lengths, counts, Promise, notify).then(function(result) {
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
exports.units.findAllLengthsForL = findAllLengthsForL;
exports.units.recursiveSolve = recursiveSolve;
exports.units.updateRecursiveCounts = updateRecursiveCounts;
exports.units.updateBoard = updateBoard;

exports.units.findRowMust = findRowMust;
exports.units.findColMust = findColMust;
exports.units.findAllMust = findAllMust;
exports.units.findMustPossibilities = findMustPossibilities;
exports.units.pickAMust = pickAMust;
exports.units.recursiveMust = recursiveMust;

// a matrix of booleans
// true: available
// false: taken, cannot mark a new cell there
function availableBoard(numRows, numCols) {
  var available;

  if(numRows.hasOwnProperty('row')) {
    // numRows is actually a board
    available = numRows.map(function(r) {
      return r.map(function(c) {
        return c.state==='fill'?'must':c.state;
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
function getCounts(available, state) {
  var counts = { row: available.map(zero), col: available[0].map(zero) };
  state = state || 'fill';

  available.forEach(function(row, r) {
    row.forEach(function(cell, c) {
      if(cell === state) {
        counts.row[r]++;
        counts.col[c]++;
      }
    });
  });

  return counts;
}

function isAvailableState(a, r, c, s) {
  return (r in a) && (c in a[r]) && a[r][c] === s;
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
function canPlace(a, r, c, l, d, counts) {
  var ri = r;
  var ci = c;
  var rf = r + (d?0:l-1);
  var cf = c + (d?l-1:0);

  // the length must always be on the board
  if(ri < 0 || rf >= a.length) return false;
  if(ci < 0 || cf >= a[0].length) return false;

  if(counts) {
    if(d) {
      if(counts.row[r] < l) return false;
      for(c=ci; c<=cf; c++)
        if(counts.col[c] === 0) return false;
    } else {
      if(counts.col[c] < l) return false;
      for(r=ri; r<=rf; r++)
        if(counts.row[r] === 0) return false;
    }
  }

  // check the whole area to make sure we can place the length
  for(r=ri-1; r<=rf+1; r++)
    for(c=ci-1; c<=cf+1; c++) {
      // any of the area is fill
      if(isAvailableState(a, r, c, 'fill'))
        return false;

      // any of the boarder is must
      if(d && (ri !== r || c === ci-1 || c === cf+1) && isAvailableState(a, r, c, 'must'))
        return false;
      if(!d && (ci !== c || r === ri-1 || r === rf+1) && isAvailableState(a, r, c, 'must'))
        return false;
    }

  for(r=ri; r<=rf; r++)
    for(c=ci; c<=cf; c++)
      if(!(isAvailableState(a, r, c, 'none') || isAvailableState(a, r, c, 'must')))
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
    if(canPlace(available, r, c, 1, true) && (!colCounts || colCounts[c] > 0)) {
      // update curr
      if(!size || curr < size)
        curr++;

      // update max
      if(curr === max) {
        lengths.push({ r: r, c: c-curr+1, l: curr, d: true });
      } if(curr > max && (!size || curr === size)) {
        max = curr;
        lengths = [{ r: r, c: c-curr+1, l: curr, d: true }];
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
    if(canPlace(available, r, c, 1, false) && (!rowCounts || rowCounts[r] > 0)) {
      // update curr
      if(!size || curr < size)
        curr++;

      // update max
      if(curr === max) {
        lengths.push({ r: r-curr+1, c: c, l: curr, d: false });
      } if(curr > max && (!size || curr === size)) {
        max = curr;
        lengths = [{ r: r-curr+1, c: c, l: curr, d: false }];
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
function findAllLengthsForL(available, size, counts) {
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
//
// improvement: skip some positions
//  - if there are multiple lengths of the same size, skip some of them
//  - you don't need to remember the states, just the index (if we generate one list up front)
//  - if there are 4 '2' lengths and 7 positions, then you only need to try the first option on the first level
//  - you can also skip some of the ending positions with similar logic
//    1, 1, 1, 1, -, -, -
//    -, 2, 2, 2, 2, -, -
//    -, -, 3, 3, 3, 3, -
//    -, -, -, 4, 4, 4, 4
function recursiveSolve(available, lengths, counts, Promise, notify,
                        prevL, possible, pIdx) {
  if(notify && !_.isFunction(notify)) throw new Error('notify must be a function');
  if(!_.isUndefined(prevL) && !_.isNumber(prevL)) throw new Error('prevL must be a number');

  if(lengths.length === 0)
    return Promise.resolve(available);
  var l = lengths.pop();
  var lCount = 1+_.sumBy(lengths, function(i) { return (i===l?1:0); });
  if(l !== prevL) {
    // if we have a new length, then generate new positions
    possible = findAllLengthsForL(available, l, counts);
    pIdx = -1;
    if(possible.length === 0) {
      if(notify) notify(available);
      return Promise.reject();
    }
  }

  // start with a failed promise
  // keep going while the Promises are rejected
  // once we find a successful promise, then that will be returned
  return possible.reduce(function(prev, p, idx) {
    if(idx <= pIdx) return prev; // skip indexes before pIdx TODO improve this loop structure
    if(idx+lCount > possible.length) return prev; // skip the last ones when we don't have enough places for the possible values

    // if this is the last iteration (or only)
    // then we don't need to copy the data structures
    var isLast = (idx === possible.length-1);

    return prev.catch(function() {
      // if we can't place this piece, then keep going
      if(!canPlace(available, p.r, p.c, p.l, p.d, counts)) {
        if(isLast && notify) notify(available);
        return Promise.reject();
      }

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
            recursiveSolve(a, lens, c, Promise, notify, l, possible, idx).then(resolve, reject);
          });
        });
      } else {
        // recurse (inline)
        return recursiveSolve(a, lens, c, Promise, notify, l, possible, idx);
      }
    });
  }, Promise.reject());
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

// find all the lengths marked as must
function findRowMust(a, r) {
  var must = [];
  var curr = 0;

  var c;
  for(c=0; c<a[r].length; c++) {
    if(isAvailableState(a, r, c, 'must') && !isAvailableState(a, r+1, c, 'must') && !isAvailableState(a, r-1, c, 'must')) {
      curr++;
    } else if(curr > 0) {
      must.push({ r: r, c: c-curr, l: curr, d: true });
      curr = 0;
    }
  }
  if(curr > 0) {
    must.push({ r: r, c: c-curr, l: curr, d: true });
  }

  return must;
}

// find all the lengths marked as must
function findColMust(a, c) {
  var must = [];
  var curr = 0;

  var r;
  for(r=0; r<a.length; r++) {
    if(isAvailableState(a, r, c, 'must') && !isAvailableState(a, r, c+1, 'must') && !isAvailableState(a, r, c-1, 'must')) {
      curr++;
    } else if(curr > 0) {
      must.push({ r: r-curr, c: c, l: curr, d: false });
      curr = 0;
    }
  }
  if(curr > 0) {
    must.push({ r: r-curr, c: c, l: curr, d: false });
  }

  return must;
}

// collect all the lengths marked as must; combine both directions into one list
function findAllMust(a) {
  var must = [];

  a.map(function(ignore, r) {
    return findRowMust(a, r);
  }).forEach(function(m) {
    Array.prototype.push.apply(must, m);
  });
  a[0].map(function(ignore, c) {
    return findColMust(a, c);
  }).forEach(function(m) {
    Array.prototype.push.apply(must, m);
  });

  return must;
}

// for a given must length, find all the 'actual' lengths that will fit
function findMustPossibilities(a, m, lens, counts) {
  var possible = [];
  var len = { d: m.d };

  lens.forEach(function(l) {
    len.r = m.r;
    len.c = m.c;
    len.l = l;
    if(m.d) {
      for(;m.c + m.l <= len.c + len.l; len.c--) {
        if(canPlace(a, len.r, len.c, len.l, len.d, counts))
          possible.push(_.clone(len));
      }
    } else {
      for(;m.r + m.l <= len.r + len.l; len.r--) {
        if(canPlace(a, len.r, len.c, len.l, len.d, counts))
          possible.push(_.clone(len));
      }
    }
  });

  return possible;
}

// pick a length marked as "must"
// find ALL the lengths that can be used to satisfy the specified length
// pick the spot with the least number of lengths that can satisfy it
// the lengths returned are the only options that can be used to fill the spot
function pickAMust(available, lengths, counts) {
  var uniqueLengths = _.uniq(lengths);

  return findAllMust(available).reduce(function(best, must) {
    var next;
    if(must.l === 1) {
      // if the length is one, then we will pick it up in both directions
      // so skip it in one direction
      if(!must.d) return best;

      // consider both directions at the same time
      next = findMustPossibilities(available, must, uniqueLengths, counts);
      must.d = false;
      Array.prototype.push.apply(next, findMustPossibilities(available, must, uniqueLengths, counts));
    } else {
      next = findMustPossibilities(available, must, uniqueLengths, counts);
    }

    if(best.length === 0)
      return next;
    if(next.length > 0 && best.length > next.length)
      return next;
    
    return best;
  }, []);
}

function recursiveMust(available, lengths, counts, Promise, notify) {
  if(lengths.length === 0)
    return Promise.resolve(available);

  var possible = pickAMust(available, lengths, counts);
  if(possible.length === 0) {
    // if there is nothing else marked as "must" then solve the remaining lengths
    lengths = _.sortBy(lengths, function(l) { return +l; });
    return recursiveSolve(available, lengths, counts, Promise, notify);
  }

  return possible.reduce(function(prev, p, idx) {
    return prev.catch(function() {
      // if this is the last iteration (or only)
      // then we don't need to copy the data structures
      var isLast = (idx === possible.length-1);

      // update available
      var a = isLast?available:_.cloneDeep(available);
      doPlace(a, p.r, p.c, p.l, p.d);

      // update counts
      var c = isLast?counts:_.cloneDeep(counts);
      updateRecursiveCounts(c, p);

      // update lengths
      var lens = isLast?lengths:_.cloneDeep(lengths);
      lens.splice(lens.indexOf(p.l), 1);


      // check the values of row/col against the cells that must be filled in
      // if there are not enough remaining cells, then this is not a solution
      var mc = getCounts(a, 'must');
      if(mc.row.some(function(v, i) { return v > c.row[i]; }) ||
        mc.col.some(function(v, i) { return v > c.col[i]; }))
        return Promise.reject();


      if(notify) {
        // recurse (async)
        return new Promise(function(resolve, reject) {
          setTimeout(function() {
            recursiveMust(a, lens, c, Promise, notify).then(resolve, reject);
          });
        });
      } else {
        // recurse (inline)
        return recursiveMust(a, lens, c, Promise, notify);
      }
    });
  }, Promise.reject());
}
