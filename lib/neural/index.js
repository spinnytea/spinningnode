'use strict';
// const NeuralNetwork = require('./bpn');

// TODO get these from css?
var WORLD_WIDTH = 512;
var WORLD_HEIGHT = 512;

function Food() {
  this.x = Math.random() * WORLD_WIDTH;
  this.y = Math.random() * WORLD_HEIGHT;
}
Food.radius = 5;
Food.count = 10;


module.exports = angular.module('spinningnode.neural', []);

module.exports.controller('spinningnode.neural.app.controller', [
  '$scope',
  function($scope) {
    var foods = $scope.foods = [];
    while(foods.length < Food.count) foods.push(new Food());
  }
]);

module.exports.directive('renderFood', [
  function() {
    return function($scope, element) {
      element.css({
        'width': (Food.radius * 2) + 'px',
        'height': (Food.radius * 2) + 'px',
        'border-radius': (Food.radius) + 'px',
      });

      $scope.$on('$destroy', $scope.$watch('food.x', function(x) { element.css('left', (x-Food.radius) + 'px'); }));
      $scope.$on('$destroy', $scope.$watch('food.y', function(y) { element.css('top', (y-Food.radius) + 'px'); }));
    };
  }
]);
