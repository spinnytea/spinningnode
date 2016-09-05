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
module.exports.factory('spinningnode.event_tracker.storage', [ 'localStorageService', function(localStorageService) {
  // TODO move event id creation here
  // TODO reuse names
  return {
    BOOM: function() {
      (localStorageService.get('event_tracker.games') || []).forEach(function(game) {
        localStorageService.remove('event_tracker.' + game + '.events');
      });
      localStorageService.remove('event_tracker.games');
    },
    games: {
      list: function() {
        return localStorageService.get('event_tracker.games') || [];
      },
      add: function(game) {
        var list = localStorageService.get('event_tracker.games') || [];
        list.push(game);
        localStorageService.set('event_tracker.games', list);
        return list;
      }
    },
    events: {
      load: function(game) {
        return localStorageService.get('event_tracker.' + game + '.events') || [];
      },
      add: function(game, event) {
        var list = localStorageService.get('event_tracker.' + game + '.events') || [];
        list.push(event);
        localStorageService.set('event_tracker.' + game + '.events', list);
        return list;
      },
      update: function(game, event) {
        // XXX if this gets to be too slow, then we may need to save the events individually
        var list = localStorageService.get('event_tracker.' + game + '.events') || [];
        list.splice(_.findIndex(list, {id: event.id}), 1, event);
        localStorageService.set('event_tracker.' + game + '.events', list);
        return list;
      }
    }
  };
}]);

module.exports.controller('spinningnode.event_tracker.app.controller', [
  '$scope', 'spinningnode.event_tracker.storage',
  function($scope, storage) {
    $scope.games = storage.games.list();
  }
]);

// TODO completely redo edit.html
// TODO autocompleter for events (typeahead)
module.exports.controller('spinningnode.event_tracker.edit.controller', [
  '$scope', 'spinningnode.event_tracker.storage',
  function($scope, storage) {
    $scope.form = {
      game: '',
      create_game: '',
      event: undefined,
      create_event: '',
    };

    $scope.BOOM = storage.BOOM;
    $scope.debounce = { updateOn: 'default blur', debounce: { 'default': 500, 'blur': 0 } };

    //

    $scope.games = storage.games.list();

    $scope.createGame = function() {
      if($scope.games.indexOf($scope.form.create_game) !== -1) {
        // TODO message on the ui
        console.log('duplicate name');
        return;
      }

      $scope.form.game = $scope.form.create_game;
      $scope.form.create_game = '';
      $scope.games = storage.games.add($scope.form.game);

      // XXX not selecting initial event in <select> (it works when event is created)
      $scope.form.create_event = 'Game Start';
      $scope.createEvent();
    };

    //

    $scope.$on('$destroy', $scope.$watch('form.game', function(g) {
      if(g) {
        // load
        $scope.events = storage.events.load($scope.form.game);
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
        term: [],
      };
      $scope.form.create_event = '';
      $scope.events = storage.events.add($scope.form.game, $scope.form.event);
    };

    $scope.$on('$destroy', $scope.$watch('form.event', function(newValue, oldValue) {
      if(newValue && oldValue && newValue.id === oldValue.id) {
        $scope.events = storage.events.update($scope.form.game, $scope.form.event);
      }
    }, true));
  }
]);
