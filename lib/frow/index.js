'use strict';
var pbDB = require('./planet base/database');

module.exports = angular.module('spinningnode.frow', []);
module.exports.controller('spinningnode.frow.app.controller', [
  '$scope',
  function($scope) {
    $scope.database_str = JSON.stringify(pbDB.core.resource_types, null, 2);
  }
]);
