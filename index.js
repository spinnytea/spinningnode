'use strict';
angular.module('spinningnode', [
  require('./lib/maze/mazeModule').name,
  require('./lib/utils/datadiffModule').name,
  require('./lib/battlesudoku').name,
  'templates',
  'ngRoute'
])
.config(['$routeProvider', function($routeProvider) {
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
}])
.factory('$exceptionHandler', function() {
  return function(exception, cause) {
    if(cause) { exception.message += ' (caused by "' + cause + '")'; }
    throw exception;
  };
})
.controller('RootCtrl', [
  '$scope',
  function($scope) {
    $scope.rootKeyDown = function($event) {
      $scope.$broadcast('keydown', $event);
    };
  }
]);
