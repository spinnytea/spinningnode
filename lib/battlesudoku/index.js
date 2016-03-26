'use strict';
var auto = require('./auto');
var board = require('./board');

var theme = 'light-blue';

module.exports = angular.module('spinningnode.battlesudoku', []);
module.exports.controller('spinningnode.battlesudoku.app.controller', [
  '$scope', '$q', 'bindKeys',
  function($scope, $q, bindKeys) {
    // TODO look into hammerjs (touch gestures)
    // TODO make a quick demo/tutorial to explain the parts
    // - column counts, row counts, counts of pieces
    // - explain mark empty, mark fill, drag
    // TODO add a hint feature
    // - scatter shot a few spots size/2
    // - can only have 1 hint per game
    // - generate the hints up front, so even on reset the hints are the same
    // - don't style them differently, they are still interactable
    // TODO scoring based on board size
    // - subtract hints from the total score

    $scope.theme = theme;
    $scope.boardSize = 5;

    $scope.generateBoard = function() {
      $scope.board = auto.generate($scope.boardSize);
      $scope.win = board.checkWin($scope.board);
      $scope.hasWon = $scope.win;
    };

    $scope.attemptCount = 0; // FIXME remove attempt count
    function attempt(a) {
      $scope.attemptCount++;
      auto.units.updateBoard(a, $scope.board);
    }
    $scope.solveBoard = function() {
      $scope.attemptCount = 0;
      var before = auto.units.availableBoard($scope.board);

      auto.solve($scope.board, $q, attempt).then(function() {
        $scope.win = board.checkWin($scope.board);

        if($scope.win && !$scope.hasWon) {
          $scope.hasWon = true;
        }
      }, function() {
        // restore
        auto.units.updateBoard(before, $scope.board);
      });
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
      // TODO convert to moded input
      // - have an 'active tool' and click to toggle
      // - key board accelerator to swap
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

    bindKeys($scope, {
      'n': $scope.generateBoard,
      's': $scope.solveBoard,
      'r': $scope.reset
    });

    $scope.generateBoard();
  }
]);

module.exports.controller('spinningnode.battlesudoku.settings.controller', [
  '$scope',
  function($scope) {
    // FIXME clean up settings page
    $scope.theme = theme;
    $scope.theme_options = ['light-blue', 'teal', 'pink', 'red', 'deep-purple'];
    $scope.$on('$destroy', function() { theme = $scope.theme; });
  }
]);
