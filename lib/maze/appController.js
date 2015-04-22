'use strict';

module.exports = angular.module('spinningnode.mazes.appController', [
]).controller('spinningnode.mazes.appController', [
  '$scope',
  function($scope) {
    $scope.config = {
      width: 15,
      height: 10
    };
  }
]);
