'use strict';
var _ = require('lodash');
module.exports = angular.module('spinningnode', [
  require('./lib/maze').name,
  require('./lib/utils/datadiffModule').name,
  require('./lib/battlesudoku').name,
  require('./lib/saomenu').name,
  require('./lib/asym_proto').name,
  'templates',
  'drahak.hotkeys',
  'ngRoute'
]);
module.exports.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'menu.html'
  }).when('/mazes', {
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
  }).when('/saomenu', {
    controller: 'spinningnode.sao.menu.main.controller',
    templateUrl: 'saomenu/main.html'
  }).when('/asym_proto/main', {
    controller: 'spinningnode.asym_proto.main.controller',
    templateUrl: 'asym_proto/main.html'
  }).when('/asym_proto/alt1', {
    controller: 'spinningnode.asym_proto.alt1.controller',
    templateUrl: 'asym_proto/alt1.html'
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
