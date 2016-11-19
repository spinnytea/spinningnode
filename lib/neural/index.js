'use strict';
// const NeuralNetwork = require('./bpn');
module.exports = angular.module('spinningnode.neural', []);

// TODO get these from css?
var WORLD_WIDTH = 512;
var WORLD_HEIGHT = 512;
Food.radius = 5;
Food.count = 10;
Muncher.radius = 10;
Muncher.count = 3;

module.exports.controller('spinningnode.neural.app.controller', [
  '$scope',
  function($scope) {
    var foods = $scope.foods = [];
    var munchers = $scope.munchers = [];
    var player = new Muncher();
    player.isPlayer = true;
    munchers.push(player);

    while(foods.length < Food.count) foods.push(new Food());
    while(munchers.length < Muncher.count) munchers.push(new Muncher());
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

module.exports.directive('renderMuncher', [
  function() {
    return function($scope, element) {
      element.css({
        'width': (Muncher.radius * 2) + 'px',
        'height': (Muncher.radius * 2) + 'px',
        'border-radius': (Muncher.radius) + 'px',
      });

      $scope.$on('$destroy', $scope.$watch('muncher.isPlayer', function(bool) { element.css('border-color', (bool?'blue':null)); }));
      $scope.$on('$destroy', $scope.$watch('muncher.x', function(x) { element.css('left', (x-Muncher.radius) + 'px'); }));
      $scope.$on('$destroy', $scope.$watch('muncher.y', function(y) { element.css('top', (y-Muncher.radius) + 'px'); }));
      $scope.$on('$destroy', $scope.$watch('muncher.a', function(a) { element.css('transform', 'rotate(' + a + 'rad)'); }));
    };
  }
]);

function Food() {
  this.x = Math.random() * WORLD_WIDTH;
  this.y = Math.random() * WORLD_HEIGHT;
}

function Muncher() {
  this.x = Math.random() * WORLD_WIDTH;
  this.y = Math.random() * WORLD_HEIGHT;
  this.a = Math.random() * Math.PI * 2;

  this.isPlayer = false;
}
