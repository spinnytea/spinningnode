'use strict';
var auto = require('./auto');
var board = require('./board');

module.exports = angular.module('spinningnode.battlesudoku', []);
module.exports.controller('spinningnode.battlesudoku.app.controller', [
  '$scope',
  function($scope) {
    // TODO auto-solve board
    $scope.init = function() {
      $scope.board = auto.generate(7);
      $scope.win = board.checkWin($scope.board);
    };
    $scope.init();

    $scope.reset = function() {
      board.reset($scope.board);
    };

    // change the cell strings
    // - click on a cell to toggle between fill and none
    // - alt+click on a cell to toggle between empty and none
    // can drag to change cells
    // - can only make the same kind of transition
    // - (if you make things as empty, dragging across none will not change the empty)
    var mark = null;
    $scope.markStart = function($event, cell) {
      var isAlt = $event.shiftKey || $event.ctrlKey || $event.altKey;
      var target = (isAlt?'empty':'fill');
      target = (cell.state===target?'none':target);

      mark = { from: cell.state, to: target };
      cell.state = target;
      board.redoCounts($scope.board);
    };
    $scope.markContinue = function($event, cell) {
      if(mark === null) return;
      if(cell.state !== mark.from) return;

      cell.state = mark.to;
      board.redoCounts($scope.board);
    };
    $scope.markEnd = function() {
      mark = null;
      board.redoCounts($scope.board);
      $scope.win = board.checkWin($scope.board);
    };
  }
]);
