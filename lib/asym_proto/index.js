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

    init();
    function init() {
      delete $scope.init;
      return dataService.ping().then(function() {
        return dataService.players.get().then(function(success) {
          $scope.message = 'ready';
          $scope.players = success.data;
        }, function() {
          $scope.message = 'Failed to retrieve data.'; // XXX try again?
        });
      }, function() {
        $scope.init = init;
      });
    }
  }
]);

module.exports.factory('spinningnode.asym_proto.data.service', [
  '$http',
  function($http) {
    var SERVER = '/rest/asym';

    var instance = {};

    instance.ping = function() {
      return $http.get(SERVER + '/ping');
    };

    instance.players = { get: function() {
      return $http.get(SERVER + '/players'); // FAIL
    } };


    return instance;
  }
]);
