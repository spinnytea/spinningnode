'use strict';
module.exports = angular.module('spinningnode.battlesudoku', []);
module.exports.controller('spinningnode.battlesudoku.app.controller', [
  '$scope',
  function($scope) {
    $scope.board = initBoard([1, 2, 1], [2, 0, 0, 2]);

    var mark = null;
    $scope.markStart = function($event, row, colIdx) {
      var target = ($event.shiftKey?'empty':'fill');
      target = (row[colIdx]===target?'none':target);

      mark = { from: row[colIdx], to: target };
      row[colIdx] = target;
      $scope.win = checkWin($scope.board);
    };
    $scope.markContinue = function($event, row, colIdx) {
      if(mark === null) return;
      if(row[colIdx] !== mark.from) return;

      row[colIdx] = mark.to;
    };
    $scope.markEnd = function() {
      mark = null;
      $scope.win = checkWin($scope.board);
    };
  }
]);

function initBoard(rowNums, colNums) {
  var board = [];
  board.rowNums = rowNums;
  board.colNums = colNums;

  rowNums.forEach(function() {
    var row = [];
    colNums.forEach(function() {
      row.push('none');
    });
    board.push(row);
  });

  return board;
}

function checkWin(board) {
  var rowCount = board.rowNums.map(function() { return 0; });
  var colCount = board.colNums.map(function() { return 0; });

  board.forEach(function(row, r) {
    row.forEach(function(cell, c) {
      if(cell === 'fill') {
        colCount[c]++;
        rowCount[r]++;
      }
    });
  });

  return angular.equals(board.rowNums, rowCount) && angular.equals(board.colNums, colCount);
}