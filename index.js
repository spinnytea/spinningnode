'use strict';
require('angular').module('spinningnode', [
  require('./lib/maze/mazeModule').name,
  'ngRoute'
])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when(
    '/mazes', {
      controller: 'spinningnode.mazes.appController',
      templateUrl: 'template/maze/app.html'
    }
  ).otherwise({
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
