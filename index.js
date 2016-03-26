'use strict';
var _ = require('lodash');
module.exports = angular.module('spinningnode', [
  require('./lib/maze').name,
  require('./lib/utils/datadiffModule').name,
  require('./lib/battlesudoku').name,
  'templates',
  'drahak.hotkeys',
  'ngRoute'
]);
module.exports.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/mazes', {
    controller: 'spinningnode.mazes.appController',
    templateUrl: 'maze/app.html'
  }).when('/datadiff', {
    controller: 'spinningnode.utils.diff.controller',
    templateUrl: 'utils/datadiff.html'
  }).when('/bs', {
    controller: 'spinningnode.battlesudoku.app.controller',
    templateUrl: 'battlesudoku/app.html'
  }).when('/bs/settings', {
    controller: 'spinningnode.battlesudoku.settings.controller',
    templateUrl: 'battlesudoku/settings.html'
  }).otherwise({
    templateUrl: 'menu.html'
  });
}]);
module.exports.factory('$exceptionHandler', function() {
  return function(exception, cause) {
    if(cause) { exception.message += ' (caused by "' + cause + '")'; }
    throw exception;
  };
});
module.exports.factory('bindKeys', ['$hotkey', function($hotkey) {
  return function($scope, keys) {
    _.forEach(keys, function(fn, key) { $hotkey.bind(key, fn); });
    $scope.$on('$destroy', function() {
      _.forEach(keys, function(fn, key) { $hotkey.unbind(key, fn); });
    });
  };
}]);
