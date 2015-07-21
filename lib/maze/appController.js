'use strict';

var common = require('./algorithms/common');
var utils = require('../utils/utils');

module.exports = angular.module('spinningnode.mazes.appController', [
]).controller('spinningnode.mazes.appController', [
  '$scope', 'spinningnode.mazes.algorithms.depthfirst',
  function($scope, depthfirst) {
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

    $scope.$on('keydown', function(event, $event) {
      switch($event.which) {
        case 37: // left
          player.move('_west');
          break;
        case 38: // up
          player.move('_north');
          break;
        case 39: // right
          player.move('_east');
          break;
        case 40: // down
          player.move('_south');
          break;
      }
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
