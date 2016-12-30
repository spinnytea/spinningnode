'use strict';
module.exports = angular.module('spinningnode.sao.mvp', []);
module.exports.controller('spinningnode.sao.mvp.main.controller', [
  '$scope', 'bindKeys',
  function($scope, bindKeys) {
    $scope.player = new Player('Kirito');

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

  // hidden
  this.deaths = 0;
  this.max = _.omit(_.cloneDeep(this), ['name', 'deaths']);
}
