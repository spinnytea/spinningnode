'use strict';
var pbDB = require('./planet base/database');
var core = pbDB.core;

module.exports = angular.module('spinningnode.frow', []);
module.exports.controller('spinningnode.frow.app.controller', [
  '$scope',
  function($scope) {
    pbDB.core.add(new core.Resource({
      type: core.resource_types.Starch,
      location: new core.Location({
        how: 'map',
        what: { x: 1, y: 1 },
      }),
    }));

    $scope.database_str = JSON.stringify(core.resources, null, 2);
  }
]);
