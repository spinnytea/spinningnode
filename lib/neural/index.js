'use strict';
var NeuralNetwork = require('./bpn');
var utils = require('../utils/utils.js');
module.exports = angular.module('spinningnode.neural', []);
// TODO button to drop muncher with highest eat_gap, eat_gap_avg
// TODO instead of auto-bots, why not put the nets through a "primer" (randomly create scenario, train, repeat)

// how wide is the world (max x)
var WORLD_WIDTH = 512;
// how tall is the world (max y)
var WORLD_HEIGHT = 512;
// how long do we wait between steps (refresh rate)
var UPDATE_TIMEOUT = 10;
// we want to do some deep calculations, but not very often
var STATUS_TIMEOUT = 1000;

// how big is the food
Food.radius = 3;
// how many are on the map
Food.count = 17;

// how big is the muncher
Muncher.radius = 8;
// how many are on the map
Muncher.count = 7;
// how many are auto-bots when on
Muncher.autocount = 3;
// how much they turn when set
Muncher.turnSpeed = Math.PI/16;
// how much forward the move each step
Muncher.speed = 2;
// adjust the muncher brain learning rate (so we don't need to loop)
Muncher.learningRate = 0.08;
// how many training examples to remember (brain input, output)
Muncher.memory = 10;
// used to calculate a rolling avg, how much weight to get give the new value
Muncher.eat_gap_alpha = 0.1;

module.exports.controller('spinningnode.neural.app.controller', [
  '$scope', '$timeout', 'bindKeys',
  function($scope, $timeout, bindKeys) {
    angular.element('#world').css({ width: WORLD_WIDTH + 'px', height: WORLD_HEIGHT + 'px' });
    $scope.timeoutId = null;
    var statusTimeoutId = null;
    $scope.Muncher = Muncher;
    var foods = $scope.foods = [];
    var munchers = $scope.munchers = [];
    while(foods.length < Food.count) foods.push(new Food());
    while(munchers.length < Muncher.count) munchers.push(new Muncher());

    function worldLoop() {
      // move the munchers forward
      munchers.forEach(function(m) {
        // map input to the brain
        m.fillBrain(foods);

        // prepare the next move
        m.turn();

        // remember the current move
        m.remember();

        // take the step
        m.step();
      });

      if(munchers[0].auto) {
        // if auto is enabled, then they train the lot every step
        munchers
          .filter(function(m) { return m.auto; })
          .forEach(function(m) { m.train(munchers, true); });
      }

      // collide with food
      var someDead = false;
      munchers.forEach(function(m) {
        foods.forEach(function(f) {
          if(utils.distance(m.x, m.y, f.x, f.y) < Muncher.radius + Food.radius) {
            // collision!
            f.dead = true;
            someDead = true;
            if(!m.ate) {
              m.ate = true;
              m.eat_gap_avg = Math.floor((Muncher.eat_gap_alpha * m.eat_gap) + ((1-Muncher.eat_gap_alpha) * m.eat_gap_avg));
              m.eat_gap = 0;
            }
          }
        });
      });

      if(someDead) {
        // clear and restore food
        foods = $scope.foods = foods.filter(function(f) { return !f.dead; });
        while(foods.length < Food.count) foods.push(new Food());

        // train (all with current memory)
        munchers
          .filter(function(m) { return m.ate; })
          .forEach(function(m) { m.ate = false; m.train(munchers); });

        // console.log(munchers.map(function(m) { return Math.floor(m.eat_gap_avg); }).sort(function(a, b) { return a-b; }));
      }

      // wait and kick off the next step
      $scope.timeoutId = $timeout(worldLoop, UPDATE_TIMEOUT);
    }

    // function trainingLoop() {
    //   $scope.shuffle();
    // }

    function statusLoop() {
      // if all munchers are near the edge, then shuffle
      var gutter = Muncher.radius * 4;
      var allNearEdge = munchers.every(function(m) {
        return m.x < gutter || m.y < gutter || m.x > WORLD_WIDTH - gutter || m.y > WORLD_HEIGHT - gutter;
      });
      if(allNearEdge)
        $scope.shuffle();

      // update learning rate
      munchers.forEach(function(m) {
        // XXX should this be in an ng-change listener?
        if(Muncher.learningRate) m.brain.learning_rate = Muncher.learningRate;

        // every so often we need to decay
        // this penalizes munchers that aren't being productive
        // XXX this is not the best place for this, it just happens to be good enough; figure out where it "ought" to be
        m.forget();
      });

      statusTimeoutId = $timeout(statusLoop, STATUS_TIMEOUT);
    }


    $scope.pause = function() {
      if($scope.timeoutId) {
        $timeout.cancel($scope.timeoutId);
        $scope.timeoutId = null;
        $timeout.cancel(statusTimeoutId);
      } else {
        worldLoop();
        statusLoop();
      }
    };

    $scope.auto = function() {
      var m = 0;
      var val = !munchers[m].auto;
      for(;m<Muncher.autocount; m++)
        munchers[m].auto = val;
    };

    $scope.shuffle = function() {
      foods.forEach(function(f) { f.rand(); });
      munchers.forEach(function(m) { m.rand(); });
    };

    bindKeys($scope, {
      'p': $scope.pause,
      'a': $scope.auto,
      's': $scope.shuffle,
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
      var inCard = element.parent().hasClass('muncher-card');
      var posAdjust = (inCard?0.25:1);
      var radius = (inCard?Muncher.radius*2/3:Muncher.radius);

      element.css({
        'width': (radius * 2) + 'px',
        'height': (radius * 2) + 'px',
        'border-radius': (radius) + 'px',
      });

      $scope.$on('$destroy', $scope.$watch('muncher.auto', function(bool) { element.css('border-color', (bool?'blue':'')); }));
      $scope.$on('$destroy', $scope.$watch('muncher.x', function(x) { element.css('left', (x*posAdjust-radius) + 'px'); }));
      $scope.$on('$destroy', $scope.$watch('muncher.y', function(y) { element.css('top', (y*posAdjust-radius) + 'px'); }));
      $scope.$on('$destroy', $scope.$watch('muncher.a', function(a) { element.css('transform', 'rotate(' + a + 'rad)'); }));
    };
  }
]);

function Food() {
  this.x = 0;
  this.y = 0;
  this.dead = false;

  this.rand();
}
Food.prototype.rand = function() {
  this.x = Math.random() * (WORLD_WIDTH - Food.radius * 2) + Food.radius;
  this.y = Math.random() * (WORLD_HEIGHT - Food.radius * 2) + Food.radius;
};

function Muncher() {
  this.x = 0;
  this.y = 0;
  this.a = 0;
  this.nextLeft = false;
  this.nextRight = false;

  this.auto = false;
  this.ate = false;
  this.brain = new NeuralNetwork(6, 9, 2);
  this.memory = { l: [], r: [], s: [] };
  this.eat_gap = 0;
  this.eat_gap_avg = 0;
  this.trainer = 0;
  this.trainee = 0;

  this.rand();
}
Muncher.prototype.rand = function() {
  this.x = Math.random() * (WORLD_WIDTH - Muncher.radius * 2) + Muncher.radius;
  this.y = Math.random() * (WORLD_HEIGHT - Muncher.radius * 2) + Muncher.radius;
  this.a = Math.random() * Math.PI * 2;
  this.memory.l.splice(0);
  this.memory.r.splice(0);
  this.memory.s.splice(0);
};
Muncher.prototype.fillBrain = function(foods) {
  var m = this;
  // food => [ dist, Δa ]
  foods.map(function(f) { return [
    utils.distance(m.x, m.y, f.x, f.y) / WORLD_WIDTH, // XXX what about height?
    utils.wrap(-Math.PI, Math.atan2(f.y-m.y, f.x-m.x) - m.a, Math.PI) / Math.PI,
  ]; }).sort(function(f1, f2) {
    return f1[0] - f2[0];
  }).slice(0, 3).forEach(function(f, idx) {
    m.brain.input[2*idx + 0] = f[0];
    m.brain.input[2*idx + 1] = f[1];
  });
};
Muncher.prototype.turn = function(auto) {
  if(auto || this.auto) {
    var closest_angle = Math.min(
      // closest food is always in the running
      (this.brain.input[1]),
      // if the second food is too far, then ignore it's angle
      ((this.brain.input[2]/2 > this.brain.input[0])?Infinity:this.brain.input[3]),
      // if the third food is too far, then ignore it's angle
      ((this.brain.input[4]/2 > this.brain.input[0])?Infinity:this.brain.input[5])
    );
    // basic logic
    if(-0.2 < closest_angle && closest_angle < 0.2) {
      // straight
      this.nextLeft = false;
      this.nextRight = false;
    } else if(-0.7 < closest_angle && closest_angle < 0) {
      // slight left
      this.nextLeft = true;
      this.nextRight = false;
    } else {
      // right
      this.nextLeft = false;
      this.nextRight = true;
    }
  } else {
    // run the net!
    this.brain.feed();

    // map the outputs
    this.nextLeft = (this.brain.output[0] > 0.5);
    this.nextRight = (this.brain.output[1] > 0.5);
  }
};
Muncher.prototype.remember = function() {
  // pick which memory slot to put it in
  var array = (this.nextLeft===this.nextRight?this.memory.s:(this.nextLeft?this.memory.l:this.memory.r));
  array.unshift([
    this.brain.input.slice(0),
    [this.nextLeft?1:0,this.nextRight?1:0]
  ]);
  if(array.length > Muncher.memory)
    array.pop();
};
Muncher.prototype.forget = function() {
  this.memory.r.pop();
  this.memory.l.pop();
  this.memory.s.pop();
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
Muncher.prototype.train = function(munchers, auto) {
  var memory = this.memory;
  if(!auto) this.trainer += this.brain.learning_rate * (memory.l.length+memory.r.length+memory.s.length);
  munchers.forEach(function(m) {
    m.trainee += m.brain.learning_rate * (memory.l.length+memory.r.length+memory.s.length);
    memory.l.forEach(function(r) { m.brain.train(r[1], r[0]); });
    memory.r.forEach(function(r) { m.brain.train(r[1], r[0]); });
    memory.s.forEach(function(r) { m.brain.train(r[1], r[0]); });
  });
};
