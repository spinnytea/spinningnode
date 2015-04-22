'use strict';
require('angular').module('spinningnode', [
  'ngRoute'
])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.otherwise({
      templateUrl: 'template/menu.html'
    });
  }])
  .factory('$exceptionHandler', function() {
    return function(exception, cause) {
      if(cause) { exception.message += ' (caused by "' + cause + '")'; }
      throw exception;
    };
  });
