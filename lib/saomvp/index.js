'use strict';
// var _ = require('lodash');
var Player = require('./players');

module.exports = angular.module('spinningnode.sao.mvp', []);
module.exports.controller('spinningnode.sao.mvp.main.controller', [
  '$scope', 'bindKeys',
  function($scope, bindKeys) {
    $scope.player = new Player('Kirito');

    bindKeys($scope, {
      'Esc': function() { $scope.showMenu = !$scope.showMenu; },
    });
  }
]);
