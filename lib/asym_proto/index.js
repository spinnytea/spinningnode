'use strict';
var _ = require('lodash');
module.exports = angular.module('spinningnode.asym_proto', []);

var MIN_X = 2;
var MIN_Y = 2;
var MAX_X = 38;
var MAX_Y = 28;

// TODO remove messages, instead have UI element or other on-screen feedback

module.exports.directive('asymProtoPageHeader', [
  function() {
    return {
      restrict: 'A',
      scope: true,
      templateUrl: 'asym_proto/header.html',
      controller: [
        '$scope',
        '$location',
        AsymProtoPageHeaderController
      ]
    };

    function AsymProtoPageHeaderController($scope, $location) {
      $scope.pages = [
        { path: '/asym_proto/main', subtitle: 'Main' },
        { path: '/asym_proto/players', subtitle: 'Players' },
        { path: '/asym_proto/player', subtitle: 'Player' },
      ];
      $scope.page = _.find($scope.pages, { path: $location.path() });
    }
  }
]);
module.exports.controller('spinningnode.asym_proto.main.controller', [
  '$scope',
  '$q',
  'bindKeys',
  'spinningnode.asym_proto.data.service',
  function($scope, $q, bindKeys, dataService) {
    $scope.message = 'fetching data...';
    $scope.activePlayer = undefined;
    $scope.selectPlayer = function(p) { $scope.activePlayer = ($scope.activePlayer === p ? undefined : p); };
    var isSaving = false;

    function getPlayers() {
      return dataService.players.get().then(function(success) {
        $scope.players = success.data;

        // update active player
        // XXX this is the only conflict resolution; is it acceptable?
        if($scope.activePlayer) {
          if(isSaving) {
            // if we are currently trying to save, then the local copy wins
            var pIdx = _.findIndex($scope.players, { name: $scope.activePlayer.name });
            $scope.players.splice(pIdx, 1, $scope.activePlayer);
          } else {
            // overwrite the local player with the one from the server
            $scope.activePlayer = _.find($scope.players, { name: $scope.activePlayer.name });
          }
        }

        return success;
      });
    }

    function savePlayer() {
      if(!$scope.activePlayer) return $q.resolve();
      isSaving = true;
      var p = _.cloneDeep($scope.activePlayer);
      delete p.$$hashKey;
      return dataService.player.put(p).then(function() {
        isSaving = false;
      }, function() {
        isSaving = false;
      });
    }

    function moveLeft(event) {
      if(!$scope.activePlayer) return;
      event.preventDefault();
      $scope.activePlayer.x = Math.max($scope.activePlayer.x - 1, MIN_X);
      savePlayer();
    }
    function moveRight(event) {
      if(!$scope.activePlayer) return;
      event.preventDefault();
      $scope.activePlayer.x = Math.min($scope.activePlayer.x + 1, MAX_X);
      savePlayer();
    }
    function moveUp(event) {
      if(!$scope.activePlayer) return;
      event.preventDefault();
      $scope.activePlayer.y = Math.max($scope.activePlayer.y - 1, MIN_Y);
      savePlayer();
    }
    function moveDown(event) {
      if(!$scope.activePlayer) return;
      event.preventDefault();
      $scope.activePlayer.y = Math.min($scope.activePlayer.y + 1, MAX_Y);
      savePlayer();
    }

    bindKeys($scope, {
      'left': moveLeft,
      'right': moveRight,
      'up': moveUp,
      'down': moveDown,
    });

    // load the initial list of players
    // if it fails, allow a retry
    var UPDATE_INTERVAL_DELAY = 1000;
    var updateIntervalHandle;
    $scope.$on('$destroy', function() { clearInterval(updateIntervalHandle); });
    init();
    function init() {
      delete $scope.init;
      clearInterval(updateIntervalHandle);
      return getPlayers().then(function(success) {
        $scope.message = 'ready';
        $scope.players = success.data;
        setInterval(getPlayers, UPDATE_INTERVAL_DELAY);
      }, function() {
        $scope.message = 'Failed to retrieve data.';
        $scope.init = init;
      });
    }
  }
]);
module.exports.controller('spinningnode.asym_proto.players.controller', [
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

module.exports.controller('spinningnode.asym_proto.player.controller', [
  '$scope',
  '$routeParams',
  'spinningnode.asym_proto.data.service',
  function($scope, $routeParams, dataService) {
    $scope.message = 'fetching data...';
    $scope.player = undefined;
    $scope.allowLogin = !$routeParams.name;
    $scope.playerDNE = false;

    $scope.constraints = {
      min_x: MIN_X,
      min_y: MIN_Y,
      max_x: MAX_X,
      max_y: MAX_Y,
    };

    // check to see that the server is ready
    init();
    function init() {
      delete $scope.init;
      return dataService.ping().then(function() {
        $scope.message = 'ready';
        if($routeParams.name)
          return $scope.loadPlayer();
      }, function() {
        $scope.message = 'Failed to retrieve data.';
        $scope.init = init;
      });
    }

    // the top part lets you select a person
    // XXX disable save/load until finished
    $scope.loginData = { name: undefined };
    $scope.loadPlayer = function() {
      var name = $routeParams.name || $scope.loginData.name;
      return dataService.player.get(name).then(function(success) {
        $scope.player = success.data;
        $scope.playerDNE = false;
        $scope.message = 'Player loaded.';
      }, function(failure) {
        $scope.player = undefined;
        if (failure.status === 404) {
          $scope.message = 'Player does not exist.';
          $scope.playerDNE = true;
        } else {
          $scope.message = 'Failed to load player.';
          $scope.playerDNE = false;
          $scope.init = init;
        }
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
