'use strict';

var Map = require('./map').Map;

module.exports = angular.module('spinningnode.4d_maze', []);
module.exports.controller('spinningnode.4d_maze.main.controller', [
  '$scope',
  function($scope) {
    $scope.message = 'hello world';

    $scope.map = new Map(2, 2);
    // $scope.map = new Map(2, 2, 2, 2);
  }
]);
