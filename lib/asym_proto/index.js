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

    $scope.contrast = function(c) {
      c = hexToRgb(c);
      var brightness = Math.sqrt(0.241*c.r*c.r + 0.691*c.g*c.g + 0.068*c.b*c.b);
      if(brightness < 130)
        return 'white';
      return 'black';
    };

    // XXX probably not a good implementation, I just wanted to try it
    // update each record in the list one at a time
    // wait a while between each query
    // error check before and after query
    var ROLLING_UPDATE_TIMEOUT = 1000;
    var updateIdx = 0;
    $scope.updateNext = function(idx) { updateIdx = idx; };
    $scope.isUpdateNext = function(idx) { return (updateIdx % $scope.players.length) === idx; };
    var currTimeout;
    function rollingUpdate() {
      if($scope.players.length) {
        var currIdx = (updateIdx %= $scope.players.length);
        $scope.currUpdateName = $scope.players[currIdx].name;
        dataService.player.get($scope.players[currIdx].name).then(function(success) {
          if((currIdx < $scope.players.length) && ($scope.currUpdateName === $scope.players[currIdx].name))
            $scope.players[currIdx] = success.data;
          updateIdx++;
          currTimeout = setTimeout(rollingUpdate, ROLLING_UPDATE_TIMEOUT);
          $scope.currUpdateName = undefined;
        }, function() {
          currTimeout = setTimeout(rollingUpdate, ROLLING_UPDATE_TIMEOUT);
        });
      }
    }
    $scope.$on('$destroy', function() { clearTimeout(currTimeout); });

    // load the initial list of players
    // if it fails, allow a retry
    init();
    function init() {
      delete $scope.init;
      return dataService.players.get().then(function(success) {
        $scope.message = 'ready';
        $scope.players = success.data;
        currTimeout = setTimeout(rollingUpdate, ROLLING_UPDATE_TIMEOUT);
      }, function() {
        $scope.message = 'Failed to retrieve data.';
        $scope.init = init;
      });
    }
  }
]);

module.exports.controller('spinningnode.asym_proto.alt2.controller', [
  '$scope',
  'spinningnode.asym_proto.data.service',
  function($scope, dataService) {
    $scope.message = 'fetching data...';
    $scope.player = undefined;

    // check to see that the server is ready
    init();
    function init() {
      delete $scope.init;
      return dataService.ping().then(function() {
        $scope.message = 'ready';
      }, function() {
        $scope.message = 'Failed to retrieve data.';
        $scope.init = init;
      });
    }

    // the top part lets you select a person
    // XXX disable save/load until finished
    $scope.loginData = { name: undefined };
    $scope.loadPlayer = function() {
      return dataService.player.get($scope.loginData.name).then(function(success) {
        $scope.player = success.data;
        $scope.message = 'Player loaded.';
      }, function(failure) {
        $scope.player = undefined;
        if(failure.status === 404)
          $scope.message = 'Player does not exist.';
        else
          $scope.message = 'Failed to load player.';
      });
    };
    $scope.savePlayer = function() {
      return dataService.player.put($scope.player).then(function() {
        $scope.message = 'Player saved.';
      }, function() {
        $scope.message = 'Failed to save player.';
      });
    };
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
      get: function(name) { return $http.get(SERVER + '/players/' + name); },
      put: function(player) { return $http.put(SERVER + '/players/' + player.name, player); },
    };

    return instance;
  }
]);

// some utility functions
// because css doesn't have a contrast function
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}
function rgbToHex(r, g, b) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
void(rgbToHex);
