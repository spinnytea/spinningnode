'use strict';
module.exports = angular.module('spinningnode.battlesudoku', []);
module.exports.controller('spinningnode.battlesudoku.app.controller', [
  '$scope',
  function($scope) {
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
  board.rowNums = rowNums;
  board.colNums = colNums;
  board.lengths = lengths;

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
  board.rowCount = board.rowNums.map(function() { return 0; });
  board.colCount = board.colNums.map(function() { return 0; });

  board.forEach(function(row, r) {
    row.forEach(function(cell, c) {
      if(cell === 'fill') {
        board.colCount[c]++;
        board.rowCount[r]++;
      }
    });
  });
}

function checkWin(board) {
  // TODO check lengths
  return angular.equals(board.rowNums, board.rowCount) && angular.equals(board.colNums, board.colCount);
}