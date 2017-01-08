'use strict';

var Map = require('./map').Map;

module.exports = angular.module('spinningnode.four_d_maze', []);
module.exports.controller('spinningnode.four_d_maze.main.controller', [
  '$scope',
  function($scope) {
    $scope.message = 'hello world';
    $scope.map = new Map(2, 2, 2, 2);
  }
]);

module.exports.controller('spinningnode.four_d_maze.demo.controller', [
  '$scope',
  function($scope) {
    // TODO render as line (maybe just get rid of sides?)
    $scope.one = new Map(3);
    // across
    $scope.one.door([0], 0, true);
    $scope.one.door([1], 0, true);

    // TODO render as square (that's how it is now)
    $scope.two = new Map(3, 3);
    // same as one
    $scope.two.door([0, 0], 0, true);
    $scope.two.door([1, 0], 0, true);
    // left/right down
    $scope.two.door([0, 0], 1, true);
    $scope.two.door([2, 0], 1, true);
    // cut to middle, down
    $scope.two.door([0, 1], 0, true);
    $scope.two.door([1, 1], 1, true);
    // across bottom
    $scope.two.door([0, 2], 0, true);
    $scope.two.door([1, 2], 0, true);

    // TODO render as hexagon
    $scope.three = new Map(3, 3, 3);
    // same as two
    $scope.three.door([0, 0, 0], 0, true);
    $scope.three.door([1, 0, 0], 0, true);
    $scope.three.door([0, 0, 0], 1, true);
    $scope.three.door([2, 0, 0], 1, true);
    $scope.three.door([0, 1, 0], 0, true);
    $scope.three.door([1, 1, 0], 1, true);
    $scope.three.door([0, 2, 0], 0, true);
    $scope.three.door([1, 2, 0], 0, true);

    // TODO render as octagon
    $scope.four = new Map(3, 3, 3, 3);
    // same as two
    $scope.four.door([0, 0, 0, 0], 0, true);
    $scope.four.door([1, 0, 0, 0], 0, true);
    $scope.four.door([0, 0, 0, 0], 1, true);
    $scope.four.door([2, 0, 0, 0], 1, true);
    $scope.four.door([0, 1, 0, 0], 0, true);
    $scope.four.door([1, 1, 0, 0], 1, true);
    $scope.four.door([0, 2, 0, 0], 0, true);
    $scope.four.door([1, 2, 0, 0], 0, true);
  }
]);

module.exports.directive('connections', function() {
  return function($scope, elem, attrs) {
    // room.d
    $scope.$eval(attrs.connections).d.forEach(function(c, i) {
      if(c.b) elem.addClass('d' + i + 'b');
      if(c.f) elem.addClass('d' + i + 'f');
    });
  };
});
