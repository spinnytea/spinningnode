'use strict';
var NeuralNetwork = require('./bpn');
var utils = require('../utils/utils.js');
module.exports = angular.module('spinningnode.neural', []);
// TODO how do we better document the brain? how do we organize the parts so they are in the same place
//  - init, input map, output map

// how wide is the world (max x)
var WORLD_WIDTH = 512; // TODO get from css?
// how tall is the world (max y)
var WORLD_HEIGHT = 512; // TODO get from css?
// how long do we wait between steps (refresh rate)
var UPDATE_TIMEOUT = 10;
// when a muncher eats something, how many times do we train with the memory?
var EAT_TRAIN_LOOP_COUNT = 10;
// when we step an auto bot, how many times do we train the current step?
var AUTO_TRAIN_LOOP_COUNT = 50;

// how big is the food
Food.radius = 5;
// how many are on the map
Food.count = 30;

// how big is the muncher
Muncher.radius = 10;
// how many are on the map
Muncher.count = 7;
// how many are auto-bots when on
Muncher.autocount = 3;
// how much they turn when set
Muncher.turnSpeed = Math.PI/16;
// how much forward the move each step
Muncher.speed = 3;
// how many training examples to remember (brain input, output)
Muncher.memory = 20;
// used to calculate a rolling avg, how much weight to get give the new value
Muncher.eat_gap_alpha = 0.1;

module.exports.controller('spinningnode.neural.app.controller', [
  '$scope', '$timeout', 'bindKeys',
  function($scope, $timeout, bindKeys) {
    $scope.timeoutId = null;
    var foods = $scope.foods = [];
    var munchers = $scope.munchers = [];
    while(foods.length < Food.count) foods.push(new Food());
    while(munchers.length < Muncher.count) munchers.push(new Muncher());

    function worldLoop() {
      // move the munchers forward
      munchers.forEach(function(m) {
        // map input to the brain
        // food => [ dist, Δa ]
        foods.map(function(f) { return [
          utils.distance(m.x, m.y, f.x, f.y) / WORLD_WIDTH, // XXX what about height?
          utils.wrap(-Math.PI, Math.atan2(f.y-m.y, f.x-m.x) - m.a, Math.PI) / Math.PI,
        ]; }).sort(function(f1, f2) {
          return f1[0] - f2[0];
        }).slice(0, 1).forEach(function(f, idx) {
          m.brain.input[2*idx + 0] = f[0];
          m.brain.input[2*idx + 1] = f[1];
        });

        // prepare the next move
        if(m.auto) {
          var closest_angle = m.brain.input[1];
          // basic logic
          if(-0.2 < closest_angle && closest_angle < 0.2) {
            // straight
            m.nextLeft = false;
            m.nextRight = false;
          } else if(-0.5 < closest_angle && closest_angle < 0) {
            // slight left
            m.nextLeft = true;
            m.nextRight = false;
          } else {
            // right
            m.nextLeft = false;
            m.nextRight = true;
          }
        } else {
          // run the net!
          m.brain.feed();

          // map the outputs
          m.nextLeft = (m.brain.output[0] > 0.5);
          m.nextRight = (m.brain.output[1] > 0.5);
        }

        // remember the current move
        m.remember();

        // take the step
        m.step();
      });

      // train all every time
      // XXX clean up this section, it looks rather sloppy
      if(munchers[0].auto) {
        munchers.forEach(function(m) {
          if(m.auto) {
            munchers.forEach(function(m2) {
              for(var loop=AUTO_TRAIN_LOOP_COUNT; loop>0; loop--)
                m2.brain.train(m.memory[0][1], m.memory[0][0]);
            });
          }
        });
      }

      // collide with food
      var someDead = false;
      munchers.forEach(function(m) {
        foods.forEach(function(f) {
          if(utils.distance(m.x, m.y, f.x, f.y) < Muncher.radius + Food.radius) {
            // collision!
            f.dead = true;
            m.ate = true;
            someDead = true;
            m.eat_gap_avg = (Muncher.eat_gap_alpha * m.eat_gap) + ((1-Muncher.eat_gap_alpha) * m.eat_gap_avg);
            m.eat_gap = 0;
          }
        });
      });

      if(someDead) {
        // clear and restore food
        foods = $scope.foods = foods.filter(function(f) { return !f.dead; });
        while(foods.length < Food.count) foods.push(new Food());

        // train (all with current memory)
        munchers.filter(function(m) { return m.ate; }).forEach(function(m) {
          munchers.forEach(function(m2) {
            // train with all the moments leading up to this
            for(var loop=EAT_TRAIN_LOOP_COUNT; loop>0; loop--)
              m.memory.forEach(function(r) { m2.brain.train(r[1], r[0]); });
          });
        });

        // console.log(munchers.map(function(m) { return Math.floor(m.eat_gap_avg); }).sort(function(a, b) { return a-b; }));
      }

      // wait and kick off the next step
      $scope.timeoutId = $timeout(worldLoop, UPDATE_TIMEOUT);
    }


    $scope.pause = function() {
      if($scope.timeoutId) {
        $timeout.cancel($scope.timeoutId);
        $scope.timeoutId = null;
      } else {
        worldLoop();
      }
    };

    $scope.auto = function() {
      var m = 0;
      var val = !munchers[m].auto;
      for(;m<Muncher.autocount; m++)
        munchers[m].auto = val;
    };

    bindKeys($scope, {
      'p': $scope.pause,
      'a': $scope.auto,
    });


    // start running
    $scope.auto();
    $scope.pause();
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

      $scope.$on('$destroy', $scope.$watch('muncher.auto', function(bool) { element.css('border-color', (bool?'blue':'')); }));
      $scope.$on('$destroy', $scope.$watch('muncher.x', function(x) { element.css('left', (x-Muncher.radius) + 'px'); }));
      $scope.$on('$destroy', $scope.$watch('muncher.y', function(y) { element.css('top', (y-Muncher.radius) + 'px'); }));
      $scope.$on('$destroy', $scope.$watch('muncher.a', function(a) { element.css('transform', 'rotate(' + a + 'rad)'); }));
    };
  }
]);

function Food() {
  this.x = Math.random() * (WORLD_WIDTH - Food.radius * 2) + Food.radius;
  this.y = Math.random() * (WORLD_HEIGHT - Food.radius * 2) + Food.radius;

  this.dead = false;
}

function Muncher() {
  this.x = Math.random() * (WORLD_WIDTH - Muncher.radius * 2) + Muncher.radius;
  this.y = Math.random() * (WORLD_HEIGHT - Muncher.radius * 2) + Muncher.radius;
  this.a = Math.random() * Math.PI * 2;

  this.nextLeft = false;
  this.nextRight = false;

  this.auto = false;
  this.ate = false;
  this.brain = new NeuralNetwork(2, 3, 2);
  this.memory = [];
  this.eat_gap = 0;
  this.eat_gap_avg = 0;
}
Muncher.prototype.remember = function() {
  this.memory.unshift([
    this.brain.input.slice(0),
    [this.nextLeft?1:0,this.nextRight?1:0]
  ]);
  if(this.memory.length > Muncher.memory)
    this.memory.pop();
};
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
  this.eat_gap++;
};
