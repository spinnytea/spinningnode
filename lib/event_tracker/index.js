'use strict';
var _ = require('lodash');

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

// TODO completely redo edit.html
// TODO autocompleter for events (typeahead)
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
    $scope.debounce = { updateOn: 'default blur', debounce: { 'default': 500, 'blur': 0 } };

    //

    $scope.games = localStorageService.get('event_tracker.games') || [];

    $scope.createGame = function() {
      if($scope.games.indexOf($scope.form.create_game) !== -1) {
        // TODO message on the ui
        console.log('duplicate name');
        return;
      }

      $scope.form.game = $scope.form.create_game;
      $scope.form.create_game = '';
      $scope.games.push($scope.form.game);
      localStorageService.set('event_tracker.games', $scope.games);

      // XXX not selecting initial event in <select> (it works when event is created)
      $scope.form.create_event = 'Game Start';
      $scope.createEvent();
    };

    //

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

    // XXX the first time we create a new event it might be slow
    uniqueEventId.value = 0;
    function uniqueEventId() {
      while(_.find($scope.events, { id: uniqueEventId.value }))
        uniqueEventId.value++;
      return uniqueEventId.value;
    }

    $scope.createEvent = function() {
      $scope.form.event = {
        id: uniqueEventId(),
        name: $scope.form.create_event,
        notes: '',
        pre: [],
      };
      $scope.form.create_event = '';
      $scope.events.push($scope.form.event);
      localStorageService.set('event_tracker.' + $scope.form.game + '.events', $scope.events);
    };

    $scope.$on('$destroy', $scope.$watch('form.event', function(newValue, oldValue) {
      if(newValue && oldValue && newValue.id === oldValue.id) {
        // XXX if this gets to be too slow, then we may need to save the events individually
        $scope.events.splice(_.findIndex($scope.events, {id: newValue.id}), 1, $scope.form.event);
        localStorageService.set('event_tracker.' + $scope.form.game + '.events', $scope.events);
      }
    }, true));
  }
]);
