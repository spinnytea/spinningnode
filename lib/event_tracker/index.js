'use strict';

module.exports = angular.module('spinningnode.event_tracker', [
  'ngRoute'
]);
module.exports.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/event_tracker', {
    controller: 'spinningnode.event_tracker.app.controller',
    templateUrl: 'event_tracker/app.html'
  }).when('/event_tracker/edit', {
    controller: 'spinningnode.event_tracker.edit.controller',
    templateUrl: 'event_tracker/edit.html'
  });
}]);
module.exports.controller('spinningnode.event_tracker.app.controller', [
  '$scope',
  function($scope) {
    $scope.first = 'second';
  }
]);

module.exports.controller('spinningnode.event_tracker.edit.controller', [
  '$scope', 'localStorageService',
  function($scope, localStorageService) {
    $scope.form = {
      game: '',
      create_game: '',
      event: undefined,
      create_event: '',
    };

    $scope.BOOM = localStorageService.clearAll; // TODO remove

    $scope.games = localStorageService.get('event_tracker.games') || [];
    $scope.$on('$destroy', $scope.$watch('form.game', function(g) {
      if(g) {
        // load
        $scope.events = localStorageService.get('event_tracker.' + $scope.form.game + '.events') || [];
      } else {
        // reset
        $scope.events = [];
        $scope.form.event = undefined;
        $scope.form.create_event = '';
      }
    }));

    $scope.createGame = function() {
      if($scope.games.indexOf($scope.form.create_game) !== -1) {
        // TODO message on the ui
        console.log('duplicate name'); // jshint ignore: line
        return;
      }

      $scope.games.push($scope.form.create_game);
      localStorageService.set('event_tracker.games', $scope.games);
      $scope.form.game = $scope.form.create_game;
      $scope.form.create_game = '';

      $scope.form.create_event = 'Game Start';
      $scope.createEvent();
    };

    $scope.createEvent = function() {
      // TODO event ids
      var e = {
        name: $scope.form.create_event
      };
      $scope.events.push(e);
      localStorageService.set('event_tracker.' + $scope.form.game + '.events', $scope.events);
      $scope.form.event = e;
      $scope.form.create_event = '';
    };
  }
]);
