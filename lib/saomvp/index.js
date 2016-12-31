'use strict';
// var _ = require('lodash');

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

function Player(name) {
  // stats
  this.name = name;

  // skills are unlocked through gameplay
  // there are various prereqs (e.g. stats, quest giver, pilgrimage)
  this.skills = [];
}
