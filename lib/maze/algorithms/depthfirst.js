'use strict';

var common = require('./common');
var utils = require('../../utils/utils');

module.exports = angular.module('spinningnode.mazes.algorithms.depthfirst', [
]).factory('spinningnode.mazes.algorithms.depthfirst', [
  '$q', '$timeout',
  function($q, $timeout) {
    return {
      name: 'Depth First',
      generate: function(height, width, maze) {
        var deferred = $q.defer();

        if(!maze) maze = common.init(height, width);

        var frontier = utils.shuffle(common.getWalls(maze, utils.randInt(height), utils.randInt(width)));

        function nextWall() {
          var wall;
          // add a little more randomness so our hallways aren't TTOOOO long
          if(utils.randInt(width+height) > 1)
            wall = frontier.pop();
          else
            wall = frontier.splice(utils.randInt(frontier.length), 1)[0];

          var didApply = false;
          if(!wall.to.inmaze) {
            didApply = true;
            wall.from.connect(wall.dir, wall.to);
            Array.prototype.push.apply(frontier, utils.shuffle(common.getWalls(maze, wall.to.y, wall.to.x)));
          }

          if(frontier.length > 0) {
            if(didApply)
              $timeout(nextWall, common.GENERATION_TIMEOUT);
            else
              nextWall();
          } else {
            deferred.resolve(maze);
          }
        }
        nextWall();

        return deferred.promise;
      }
    }
  }
]);
