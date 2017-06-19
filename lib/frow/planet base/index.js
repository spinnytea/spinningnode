'use strict';
var db = require('./database');
var core = db.core;

module.exports = angular.module('spinningnode.frow.pb', []);
module.exports.controller('spinningnode.frow.pb.main.controller', [
  function() {
    core.add(new core.Resource({
      type: core.resource_types.Starch,
      location: new core.Location({
        how: 'map',
        what: { x: 16, y: 9 },
      }),
    }));
    core.add(new core.Resource({
      type: core.resource_types.Plastic,
      location: new core.Location({
        how: 'map',
        what: { x: 17, y: 9 },
      }),
    }));
  }
]);

module.exports.directive('pbMap', [
  function PlanetBaseMapDirective() {
    return {
      restrict: 'E',
      replace: true,
      templateNamespace: 'svg',
      templateUrl: 'frow/planet base/pbMap.html',
      controller: [
        '$scope',
        PlanetBaseMapController
      ]
    };

    function PlanetBaseMapController($scope) {
      $scope.resources = core.resources;
    }
  }
]);

module.exports.directive('pbResource', [
  function PlanetBaseResourceDirective() {
    return {
      restrict: 'E',
      replace: true,
      scope: { resource: '=' },
      templateNamespace: 'svg',
      template: '<circle class="resource {{resource.type.name}}" cx="{{resource.location.what.x}}" cy="{{resource.location.what.y}}" />'
    };
  }
]);
