'use strict';

module.exports = angular.module('spinningnode.mazes', [
  require('./appController').name,
  require('./cellRenderer').name,
  require('./algorithms/depthfirst').name
]);
