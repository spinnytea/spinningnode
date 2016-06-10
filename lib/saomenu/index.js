'use strict';

module.exports = angular.module('spinningnode.sao.menu', []);
module.exports.controller('spinningnode.sao.menu.main.controller', [
  '$scope',
  function($scope) {
    $scope.message = 'Yeah!';
  }
]);