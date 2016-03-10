'use strict';
module.exports = angular.module('spinningnode.battlesudoku', []);
module.exports.controller('spinningnode.battlesudoku.app.controller', [
  '$scope',
  function($scope) {
    $scope.board = initBoard([1, 2, 1], [2, 0, 0, 2]);
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