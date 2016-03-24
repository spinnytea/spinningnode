'use strict';
var auto = require('./auto');
var board = require('./board');

module.exports = angular.module('spinningnode.battlesudoku', []);
module.exports.controller('spinningnode.battlesudoku.app.controller', [
  '$scope',
  function($scope) {
    // TODO provide feedback while running solve
    // - convert each recursive step into a promise; register a notify
    // TODO gulp task to build zip
    // TODO make a quick demo/tutorial to explain the parts
    // - column counts, row counts, counts of pieces
    // - explain mark empty, mark fill, drag

    // XXX add an attribute "fixed" so the game can mark spaces and the player can't interact with them
    // XXX add a hint feature?
    $scope.generateBoard = function() {
      $scope.board = auto.generate($scope.boardSize);
      $scope.win = board.checkWin($scope.board);
      $scope.hasWon = $scope.win;
    };

    $scope.solveBoard = function() {
      auto.solve($scope.board);
      $scope.win = board.checkWin($scope.board);

      if($scope.win && !$scope.hasWon) {
        $scope.hasWon = true;
      }
    };

    $scope.boardSize = 5;

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
    // TODO test controls in Firefox, Safari
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
      $scope.win = board.checkWin($scope.board);

      if($scope.win && !$scope.hasWon) {
        $scope.hasWon = true;
      }
    };

    $scope.generateBoard();
  }
]);
