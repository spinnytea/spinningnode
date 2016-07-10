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
    $scope.currUpdateName = undefined;
    $scope.players = [];

    var ROLLING_UPDATE_TIMEOUT = 1000;
    var updateIdx = 0;
    $scope.updateNext = function(idx) { updateIdx = idx; };
    $scope.isUpdateNext = function(idx) { return updateIdx === idx; };
    function rollingUpdate() {
      if($scope.players.length) {
        var currIdx = (updateIdx %= $scope.players.length);
        $scope.currUpdateName = $scope.players[currIdx].name;
        dataService.player.get($scope.players[currIdx].name).then(function(success) {
          $scope.players[currIdx] = success.data;
          updateIdx++;
          setTimeout(rollingUpdate, ROLLING_UPDATE_TIMEOUT);
          $scope.currUpdateName = undefined;
        }, function() {
          setTimeout(rollingUpdate, ROLLING_UPDATE_TIMEOUT);
        });
      }
    }

    init();
    function init() {
      delete $scope.init;
      return dataService.ping().then(function() {
        return dataService.players.get().then(function(success) {
          $scope.message = 'ready';
          $scope.players = success.data;
          setTimeout(rollingUpdate, ROLLING_UPDATE_TIMEOUT);
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

    instance.players = {
      get: function() { return $http.get(SERVER + '/players'); }
    };

    instance.player = {
      get: function(name) { return $http.get(SERVER + '/players/' + name); }
    };

    return instance;
  }
]);
