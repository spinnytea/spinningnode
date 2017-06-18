'use strict';
var db = require('./database');
var core = db.core;

module.exports = angular.module('spinningnode.frow.pb', []);
module.exports.controller('spinningnode.frow.pb.main.controller', [
  '$scope',
  function($scope) {
    core.add(new core.Resource({
      type: core.resource_types.Starch,
      location: new core.Location({
        how: 'map',
        what: { x: 1, y: 1 },
      }),
    }));

    $scope.database_str = JSON.stringify(core.resources, null, 2);
  }
]);
