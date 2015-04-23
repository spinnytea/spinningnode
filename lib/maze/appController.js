'use strict';

module.exports = angular.module('spinningnode.mazes.appController', [
]).controller('spinningnode.mazes.appController', [
  '$scope', 'spinningnode.mazes.algorithms.depthfirst',
  function($scope, depthfirst) {
    $scope.config = {
      width: 15,
      height: 10
    };

    $scope.maze = depthfirst.generate($scope.config.height, $scope.config.width);
    $scope.maze[0][0].dynamic.player = true;
  }
]);
