'use strict';

var common = require('./common');

module.exports = angular.module('spinningnode.mazes.algorithms.depthfirst', [
]).factory('spinningnode.mazes.algorithms.depthfirst', [
  function() {
    return {
      generate: function(height, width) {
        var maze = common.init(height, width);

        return maze;
      }
    }
  }
]);
