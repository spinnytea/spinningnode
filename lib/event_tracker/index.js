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
  '$scope',
  function($scope) {
    $scope.form = {
      game: '',
      create_game: '',
      event: '',
      create_event: '',
    };

    $scope.games = []; // TODO load from local storage
    $scope.events = []; // TODO load from local storage

    $scope.createGame = function() {
      if($scope.games.indexOf($scope.form.create_game) !== -1) {
        // TODO message on the ui
        console.log('duplicate name'); // jshint ignore: line
        return;
      }

      // TODO add to local storage

      $scope.games.push($scope.form.create_game);
      $scope.form.game = $scope.form.create_game;
      $scope.form.create_game = '';

      $scope.form.create_event = 'Game Start';
      $scope.createEvent();
    };

    $scope.createEvent = function() {
      // TODO add to local storage
      // TODO event ids
      var e = {
        name: $scope.form.create_event
      };
      $scope.events.push(e);
      $scope.form.event = e;
      $scope.form.create_event = '';
    };
  }
]);
