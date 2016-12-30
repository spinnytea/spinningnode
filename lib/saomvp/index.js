'use strict';
var _ = require('lodash');

module.exports = angular.module('spinningnode.sao.mvp', []);
module.exports.controller('spinningnode.sao.mvp.main.controller', [
  '$scope', 'bindKeys',
  function($scope, bindKeys) {
    $scope.player = new Player('Kirito');
    $scope.isObject = _.isObject;
    $scope.stats = _.keys($scope.player.hidden.max);

    $scope.showMenu = false; // XXX remove
    bindKeys($scope, {
      'Esc': function() { $scope.showMenu = !$scope.showMenu; },
    });
  }
]);

function Player(name) {
  // stats
  this.name = name;
  this.level = 1;
  this.health = 100;
  this.stamina = 10;

  // skills are unlocked through gameplay
  // there are various prereqs (e.g. stats, quest giver, pilgrimage)
  this.skills = [];

  // hidden
  this.hidden = {
    deaths: 0,
    max: _.omit(_.cloneDeep(this), ['name', 'skills', 'hidden']),
  };
}
