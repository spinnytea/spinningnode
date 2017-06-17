'use strict';

module.exports = angular.module('spinningnode.frow', []);
module.exports.controller('spinningnode.frow.app.controller', [
  '$scope',
  function($scope) {
    var database = {
      resources: [
        { type: 'starch', amount: 1 },
        { type: 'starch', amount: 1 },
        { type: 'starch', amount: 1 },
        { type: 'water', amount: 100 },
      ],
    };
    $scope.database_str = JSON.stringify(database, null, 2);
  }
]);
