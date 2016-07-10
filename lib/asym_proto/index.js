'use strict';

module.exports = angular.module('spinningnode.asym_proto', []);

module.exports.controller('spinningnode.asym_proto.main.controller', [
  '$scope',
  function($scope) {
    $scope.message = 'hello main';
  }
]);
module.exports.controller('spinningnode.asym_proto.alt1.controller', [
  '$scope',
  'spinningnode.asym_proto.data.service',
  function($scope, dataService) {
    $scope.message = 'fetching data...';

    dataService.players.get().then(function(data) {
      $scope.message += JSON.stringify(data);
    }, function() {
      $scope.message += ' Failed to retrieve data.';
    });
  }
]);

module.exports.factory('spinningnode.asym_proto.data.service', [
  '$http',
  function($http) {
    var SERVER = 'localhost:3000';

    var instance = {};

    instance.players = { get: function() {
      return $http.get(SERVER + '/asym/players'); // FAIL
    } };


    return instance;
  }
]);
