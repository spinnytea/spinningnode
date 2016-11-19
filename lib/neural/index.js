'use strict';
// const NeuralNetwork = require('./bpn');
var utils = require('../utils/utils.js');
module.exports = angular.module('spinningnode.neural', []);

// TODO get these from css?
var WORLD_WIDTH = 512;
var WORLD_HEIGHT = 512;
var UPDATE_TIMEOUT = 100;
Food.radius = 5;
Food.count = 10;
Muncher.radius = 10;
Muncher.count = 3;
Muncher.turnSpeed = Math.PI/16;
Muncher.speed = 3;

module.exports.controller('spinningnode.neural.app.controller', [
  '$scope', '$timeout',
  function($scope, $timeout) {
    var foods = $scope.foods = [];
    var munchers = $scope.munchers = [];
    var player = new Muncher();
    player.isPlayer = true;
    munchers.push(player);

    while(foods.length < Food.count) foods.push(new Food());
    while(munchers.length < Muncher.count) munchers.push(new Muncher());

    function worldLoop() {
      // move the munchers forward
      munchers.forEach(function(m) {
        m.step();
      });

      // wait and kick off the next step
      $timeout(worldLoop, UPDATE_TIMEOUT);
    }
    worldLoop();
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
  this.x = Math.random() * (WORLD_WIDTH - Food.radius * 2) + Food.radius;
  this.y = Math.random() * (WORLD_HEIGHT - Food.radius * 2) + Food.radius;
}

function Muncher() {
  this.x = Math.random() * (WORLD_WIDTH - Muncher.radius * 2) + Muncher.radius;
  this.y = Math.random() * (WORLD_HEIGHT - Muncher.radius * 2) + Muncher.radius;
  this.a = Math.random() * Math.PI * 2;

  this.nextLeft = false;
  this.nextRight = false;

  this.isPlayer = false;
}
Muncher.prototype.step = function() {
  if(this.nextLeft ^ this.nextRight) {
    if(this.nextLeft && !this.nextRight) this.a -= Muncher.turnSpeed;
    if(!this.nextLeft && this.nextRight) this.a += Muncher.turnSpeed;
    this.a = utils.wrap(-Math.PI, this.a, Math.PI);
  }
  this.x += Math.cos(this.a) * Muncher.speed;
  this.x = utils.clamp(Muncher.radius, this.x, WORLD_WIDTH-Muncher.radius);
  this.y += Math.sin(this.a) * Muncher.speed;
  this.y = utils.clamp(Muncher.radius, this.y, WORLD_HEIGHT-Muncher.radius);
};
