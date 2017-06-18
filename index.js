'use strict';
var _ = require('lodash');
module.exports = angular.module('spinningnode', [
  require('./lib/maze').name,
  require('./lib/4d_maze').name,
  require('./lib/neural').name,
  require('./lib/utils/datadiffModule').name,
  require('./lib/battlesudoku').name,
  require('./lib/saomenu').name,
  require('./lib/saomvp').name,
  require('./lib/asym_proto').name,
  require('./lib/event_tracker').name,
  require('./lib/frow').name,
  'templates',
  'drahak.hotkeys',
  'LocalStorageModule',
  'ngRoute'
]);
module.exports.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'menu.html'
  }).when('/mazes', {
    controller: 'spinningnode.mazes.appController',
    templateUrl: 'maze/app.html'
  }).when('/4d_maze', {
    controller: 'spinningnode.four_d_maze.main.controller',
    templateUrl: '4d_maze/app.html'
  }).when('/4d_maze/demo', {
    controller: 'spinningnode.four_d_maze.demo.controller',
    templateUrl: '4d_maze/demo.html'
  }).when('/neural', {
    controller: 'spinningnode.neural.app.controller',
    templateUrl: 'neural/app.html'
  }).when('/datadiff', {
    controller: 'spinningnode.utils.diff.controller',
    templateUrl: 'utils/datadiff.html'
  }).when('/bs', {
    controller: 'spinningnode.battlesudoku.app.controller',
    templateUrl: 'battlesudoku/app.html'
  }).when('/bs/settings', {
    controller: 'spinningnode.battlesudoku.settings.controller',
    templateUrl: 'battlesudoku/settings.html'
  }).when('/saomenu', {
    controller: 'spinningnode.sao.menu.main.controller',
    templateUrl: 'saomenu/main.html'
  }).when('/saomvp', {
    controller: 'spinningnode.sao.mvp.main.controller',
    templateUrl: 'saomvp/app.html'
  }).when('/asym_proto/main', {
    controller: 'spinningnode.asym_proto.main.controller',
    templateUrl: 'asym_proto/main.html'
  }).when('/asym_proto/players', {
    controller: 'spinningnode.asym_proto.players.controller',
    templateUrl: 'asym_proto/players.html'
  }).when('/asym_proto/players/:name', {
    controller: 'spinningnode.asym_proto.player.controller',
    templateUrl: 'asym_proto/player.html'
  }).when('/asym_proto/player', {
    controller: 'spinningnode.asym_proto.player.controller',
    templateUrl: 'asym_proto/player.html'
  }).when('/frow', {
    controller: 'spinningnode.frow.app.controller',
    templateUrl: 'frow/app.html'
  }).when('/frow/docs', {
    templateUrl: 'frow/docs.html'
  }).otherwise({
    templateUrl: 'oops.html'
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
module.exports.directive('btn', [function() {
  return {
    restrict: 'C',
    link: function($scope, elem, attr) {
      if(('title' in attr) && ('ngDisabled' in attr)) {
        var span = elem.wrap('<span/>').parent();
        $scope.$on('$destroy', $scope.$watch(function() { return attr.title; }, function(title) {
          span.attr('title', title);
        }));
      }
    }
  };
}]);
module.exports.filter('shortNumber', [function() {
  return function(number, precision, minimum) {
    number = parseFloat(number);
    precision = precision || 0;
    minimum = minimum || 1000;

    if(isNaN(number)) return '';
    if(number < minimum) return number.toFixed(precision);

    var powerOfTen = Math.floor(Math.log(Math.abs(number)) * Math.LOG10E);
    switch(powerOfTen) {
      case 3: case 4: case 5:
        return (number / Math.pow(10, 3)).toFixed(precision) + 'k';
      case 6: case 7: case 8:
        return (number / Math.pow(10, 6)).toFixed(precision) + 'm';
      case 9: case 10: case 11:
        return (number / Math.pow(10, 9)).toFixed(precision) + 'b';
      default:
        return (number / Math.pow(10, 12)).toFixed(precision) + 't';
    }
  };
}]);