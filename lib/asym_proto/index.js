'use strict';

module.exports = angular.module('spinningnode.asym_proto', []);

module.exports.controller('spinningnode.asym_proto.main.controller', [
  '$scope',
  function($scope) {
    $scope.message = 'hello';
  }
]);
