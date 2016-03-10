'use strict';
var board = require('./board');

module.exports = angular.module('spinningnode.battlesudoku', []);
module.exports.controller('spinningnode.battlesudoku.app.controller', [
  '$scope',
  function($scope) {
    // TODO generate board
    // TODO auto-solve board
    $scope.board = board.initBoard([1, 4, 1, 2, 1], [2, 1, 1, 0, 5], [5, 3, 1]);

    var mark = null;
    $scope.markStart = function($event, row, colIdx) {
      var target = ($event.shiftKey?'empty':'fill');
      target = (row[colIdx]===target?'none':target);

      mark = { from: row[colIdx], to: target };
      row[colIdx] = target;
      board.redoCounts($scope.board);
      $scope.win = board.checkWin($scope.board);
    };
    $scope.markContinue = function($event, row, colIdx) {
      if(mark === null) return;
      if(row[colIdx] !== mark.from) return;

      row[colIdx] = mark.to;
      board.redoCounts($scope.board);
    };
    $scope.markEnd = function() {
      mark = null;
      board.redoCounts($scope.board);
      $scope.win = board.checkWin($scope.board);
    };
  }
]);
