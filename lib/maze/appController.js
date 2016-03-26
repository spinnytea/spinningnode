'use strict';

var common = require('./algorithms/common');
var utils = require('../utils/utils');

module.exports = angular.module('spinningnode.mazes.appController', [
]).controller('spinningnode.mazes.appController', [
  '$scope', 'bindKeys', 'spinningnode.mazes.algorithms.depthfirst',
  function($scope, bindKeys, depthfirst) {
    $scope.config = {
      width: 15,
      height: 10
    };

    var player = {
      loc: undefined,
      move: function(dir) {
        if(player.loc[dir]) {
          player.loc.dynamic.player = false;
          player.loc = player.loc[dir];
          player.loc.dynamic.player = true;
          player.loc.dynamic.visited = true;
        }
      }
    };

    bindKeys($scope, {
      'up': function() { player.move('_north'); },
      'down': function() { player.move('_south'); },
      'left': function() { player.move('_west'); },
      'right': function() { player.move('_east'); },
    });

    $scope.generate = function() {
      var height = Math.max($scope.config.height, 3);
      var width = Math.max($scope.config.width, 3);

      $scope.maze = common.init(height, width);
      depthfirst.generate(height, width, $scope.maze).then(function() {
        player.loc = $scope.maze[utils.randInt(height-2)+1][utils.randInt(width-2)+1];
        player.loc.dynamic.player = true;
        player.loc.dynamic.visited = true;
      });
    };
    $scope.generate();
  }
]);
