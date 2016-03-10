'use strict';
module.exports = angular.module('spinningnode.battlesudoku', []);
module.exports.controller('spinningnode.battlesudoku.app.controller', [
  '$scope',
  function($scope) {
    // TODO generate board
    // TODO auto-solve board
    $scope.board = initBoard([1, 4, 1, 2, 1], [2, 1, 1, 0, 5], [5, 3, 1]);

    var mark = null;
    $scope.markStart = function($event, row, colIdx) {
      var target = ($event.shiftKey?'empty':'fill');
      target = (row[colIdx]===target?'none':target);

      mark = { from: row[colIdx], to: target };
      row[colIdx] = target;
      redoCounts($scope.board);
      $scope.win = checkWin($scope.board);
    };
    $scope.markContinue = function($event, row, colIdx) {
      if(mark === null) return;
      if(row[colIdx] !== mark.from) return;

      row[colIdx] = mark.to;
      redoCounts($scope.board);
    };
    $scope.markEnd = function() {
      mark = null;
      redoCounts($scope.board);
      $scope.win = checkWin($scope.board);
    };
  }
]);

function initBoard(rowNums, colNums, lengths) {
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
      if(cell === 'fill') {
        board.col[c].count++;
        board.row[r].count++;
      }
    });
  });
}

function checkWin(board) {
  // TODO check lengths
  return board.row.every(function(r) { return r.total === r.count; }) && board.col.every(function(c) { return c.total === c.count; });
}
