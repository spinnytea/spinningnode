'use strict';

exports.initBoard = initBoard;
exports.redoCounts = redoCounts;
exports.checkWin = checkWin;

// the board is an array of rows
// a row is an array of cells
// a cell is a string with a value of:
//  - 'none': nothing in the cell, empty
//  - 'empty': player marked as empty
//  - 'fill': player marked as filled in
//  - 'invalid': marked by game as incorrect, treated as fill
function isFill(cell) { return cell === 'fill' || cell === 'invalid'; }
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
      row.push('none');
    });
    board.push(row);
  });

  redoCounts(board);

  return board;
}

function redoCounts(board) {
  board.row.forEach(function(r) { r.count = 0; });
  board.col.forEach(function(c) { c.count = 0; });

  board.forEach(function(row, r) {
    row.forEach(function(cell, c) {
      if(isFill(cell)) {
        board.col[c].count++;
        board.row[r].count++;
      }
    });
  });
}

function checkWin(board) {
  var invalid = checkInvalid(board);

  // TODO check lengths
  return !invalid && board.row.every(function(r) { return r.total === r.count; }) && board.col.every(function(c) { return c.total === c.count; });
}

function checkInvalid(board) {
  var invalid = false;
  board.forEach(function(row, r) {
    row.forEach(function(cell, c) {
      if(isFill(cell)) {

        // check corners
        if(checkInvalid.checkDiagonal(board, r, c)) {
          invalid = true;
          row[c] = 'invalid';
        } else {
          row[c] = 'fill';
        }

      }
    });
  });
  return invalid;
}

checkInvalid.checkDiagonal = function(board, r, c) {
  var cornerFill = false;
  var row = board[r-1];
  if(row) cornerFill = isFill(row[c-1]) || isFill(row[c+1]);
  if(!cornerFill) {
    row = board[r+1];
    if(row) cornerFill = isFill(row[c-1]) || isFill(row[c+1]);
  }
  return cornerFill;
};
