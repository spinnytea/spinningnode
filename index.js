'use strict';
angular.module('spinningnode', [
  require('./lib/maze/mazeModule').name,
  require('./lib/utils/datadiffModule').name,
  require('./lib/battlesudoku').name,
  'ngRoute'
])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/mazes', {
    controller: 'spinningnode.mazes.appController',
    templateUrl: 'template/maze/app.html'
  }).when('/datadiff', {
    controller: 'spinningnode.utils.diff.controller',
    templateUrl: 'template/utils/datadiff.html'
  }).when('/bs', {
      controller: 'spinningnode.battlesudoku.app.controller',
      templateUrl: 'template/battlesudoku/app.html'
  }).otherwise({
    templateUrl: 'template/menu.html'
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
