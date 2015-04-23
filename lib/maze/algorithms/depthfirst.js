'use strict';

var common = require('./common');

module.exports = angular.module('spinningnode.mazes.algorithms.depthfirst', [
]).factory('spinningnode.mazes.algorithms.depthfirst', [
  function() {
    return {
      generate: function(height, width) {
        var maze = common.init(height, width);

        var frontier = common.shuffle(common.getWalls(maze, common.randInt(height), common.randInt(width)));

        while(frontier.length) {
          var next = frontier.pop();

          if(!next.to.inmaze) {
            next.from.connect(next.dir, next.to);
            Array.prototype.push.apply(frontier, common.shuffle(common.getWalls(maze, next.to.loc.y, next.to.loc.x)));
          }
        }

        return maze;
      }
    }
  }
]);
