'use strict';
var _ = require('lodash');

exports.initBoard = initBoard;
exports.reset = reset;
exports.redoCounts = redoCounts;
exports.checkWin = checkWin;

Object.defineProperty(exports, 'units', { value: {} });
exports.units.getCell = getCell;
exports.units.getCellFill = getCellFill;
exports.units.checkInvalid = checkInvalid;
exports.units.checkLengths = checkLengths;

// the board is an array of rows
// a row is an array of cells
// a cell is an object
// cell.state can be
//  - 'none': nothing in the cell, empty
//  - 'empty': player marked as empty
//  - 'fill': player marked as filled in
// cell.invalid: marked by game as incorrect
//
// board.row: an array who's objects summarize data about the row
//  - total: the total number of spots needed to be filled in
//  - count: total number of cells with 'fill'
// board.col: same as board.row but for columns
// board.len: an array who's objects represent each of the allowable lengths on the board
//  - size: how many cells long the length is
//  - done: boolean indicating if this one has been identified on the board
function initBoard(rowNums, colNums, lengths) {
  // math check
  var rowSum = rowNums.reduce(function(sum, next) { return sum + next; }, 0);
  var colSum = colNums.reduce(function(sum, next) { return sum + next; }, 0);
  var lenSum = lengths.reduce(function(sum, next) { return sum + next; }, 0);
  if(rowSum !== colSum || colSum !== lenSum)
    throw new Error('Invalid row/col/len definitions ('+rowSum+','+colSum+','+lenSum+')');

  var board = [];
  board.row = rowNums.map(function(num) { return { total: num, count: 0 }; });
  board.col = colNums.map(function(num) { return { total: num, count: 0 }; });
  board.len = lengths.map(function(num) { return { size: num, done: false }; });

  rowNums.forEach(function() {
    var row = [];
    colNums.forEach(function() {
      var cell = {};
      cell.state = 'none';
      row.push(cell);
    });
    board.push(row);
  });

  redoCounts(board);

  return board;
}

function reset(board) {
  board.forEach(function(row) {
    row.forEach(function(cell) {
      cell.state = 'none';
    });
  });
  redoCounts(board);
  checkLengths(board);
}

function redoCounts(board) {
  board.row.forEach(function(r) { r.count = 0; });
  board.col.forEach(function(c) { c.count = 0; });

  board.forEach(function(row, r) {
    row.forEach(function(cell, c) {
      if(cell.state === 'fill') {
        board.col[c].count++;
        board.row[r].count++;
      }
    });
  });
}

function checkWin(board) {
  var invalid = checkInvalid(board);
  checkLengths(board);

  return !invalid &&
    board.len.every(function(l) { return l.done; }) &&
    board.row.every(function(r) { return r.total === r.count; }) &&
    board.col.every(function(c) { return c.total === c.count; });
}

function getCell(board, r, c) {
  var row = board[r];
  if(!row) return undefined;
  return row[c];
}
function getCellFill(board, r, c) {
  var cell = getCell(board, r, c);
  if(!cell) return false;
  return cell.state === 'fill';
}

function checkInvalid(board) {
  var invalid = false;
  board.forEach(function(row, r) {
    row.forEach(function(cell, c) {

      // reset validity
      cell.invalid = false;

      // process cell
      if(cell.state === 'fill' && checkInvalid.checkDiagonal(board, r, c)) {
        invalid = true;
        cell.invalid = true;
      }

    });
  });
  return invalid;
}
checkInvalid.checkDiagonal = function(board, r, c) {
  return getCellFill(board, r-1, c-1) ||
    getCellFill(board, r-1, c+1) ||
    getCellFill(board, r+1, c-1) ||
    getCellFill(board, r+1, c+1);
};

// basic idea
// AFTER validation checks
// loop through each square
// if invalid, skip
// if there is a filled cell up or left, skip (we've already covered this one)
// project right and down to get the size
//  - if keep going down or right until we get to an empty square (that's the size)
//  - if we hit an invalid square, then cancel the projection
function checkLengths(board) {
  var found = [];
  board.forEach(function(row, r) {
    row.forEach(function(cell, c) {
      if(cell.state !== 'fill') return;
      if(cell.invalid) return;
      if(getCellFill(board, r-1, c)) return;
      if(getCellFill(board, r, c-1)) return;

      var sizeD = checkLengths.project(board, r, c, 1, 0);
      var sizeR = checkLengths.project(board, r, c, 0, 1);
      if(!sizeD || !sizeR) return; // if either is invalid, then nothing was matched

      found.push(Math.max(sizeD, sizeR));
    });
  });

  var sizes = {};
  found.forEach(function(s) {
    sizes[s] = (sizes[s]||0)+1;
  });

  board.len.forEach(function(l) { l.done = false; });
  _.forEach(sizes, function(count, size) {
    board.len
      .filter(function(l) { return l.size === +size; })
      .slice(0, +count)
      .forEach(function(l) { l.done = true; });
  });
}
// project (v.)
checkLengths.project = function(board, r, c, dr, dc) {
  var size = 1;
  var keepGoing = true;
  while(keepGoing) {
    r += dr;
    c += dc;
    var cell = getCell(board, r, c);
    if(!cell || cell.state !== 'fill') {
      keepGoing = false;
    } else {
      size++;
      if(cell.invalid) return undefined;
    }
  }
  return size;
};
