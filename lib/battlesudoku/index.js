'use strict';
var auto = require('./auto');
var board = require('./board');

module.exports = angular.module('spinningnode.battlesudoku', []);
module.exports.controller('spinningnode.battlesudoku.app.controller', [
  '$scope',
  function($scope) {
    // XXX better control for board size (an input needs to be so wide to display the number)
    // XXX add an attribute "fixed" so the game can mark spaces and the player can't interact with them
    // - add a hint feature, maybe change the auto-solve count to hints used
    $scope.generateBoard = function() {
      $scope.board = auto.generate($scope.boardSize);
      //$scope.board = board.initBoard([3,1,4,1,3,2], [5,0,2,3,2,2], [5,3,2,2,1,1]);
      $scope.win = board.checkWin($scope.board);
      $scope.hasWon = $scope.win;
      $scope.counts.new++;
    };

    $scope.solveBoard = function() {
      auto.solve($scope.board);
      board.redoCounts($scope.board);
      $scope.win = board.checkWin($scope.board);

      if($scope.win && !$scope.hasWon) {
        $scope.counts.auto++; // TODO come up with some point system; solving a 10x10 is more points than a 5x5
        $scope.hasWon = true;
      }
    };

    $scope.boardSize = 5;
    $scope.counts = {
      new: 0,
      win: 0,
      auto: 0,
    };

    $scope.reset = function() {
      board.reset($scope.board);
      $scope.win = board.checkWin($scope.board);
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

      if($scope.win && !$scope.hasWon) {
        $scope.counts.win++; // TODO come up with some point system; solving a 10x10 is more points than a 5x5
        $scope.hasWon = true;
      }
    };

    $scope.generateBoard();
  }
]);
