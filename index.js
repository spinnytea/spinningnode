'use strict';
require('angular').module('spinningnode', [
  require('./lib/maze/mazeModule').name,
  'ngRoute'
])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when(
    '/mazes', {
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
});
