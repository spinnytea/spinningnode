'use strict';
// var _ = require('lodash');
var Player = require('./players');

module.exports = angular.module('spinningnode.sao.mvp', []);
module.exports.controller('spinningnode.sao.mvp.main.controller', [
  '$scope', 'bindKeys',
  function($scope, bindKeys) {
    $scope.player = new Player('Kirito');

    $scope.filterSkills = function onlyPositiveFilter(s) {
      return s.level > 0;
    };

    bindKeys($scope, {
      'Esc': function() { $scope.showMenu = !$scope.showMenu; },
    });
  }
]);
