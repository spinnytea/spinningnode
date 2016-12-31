'use strict';
var Skill = require('./skills');

module.exports = Player;

function Player(name) {
  // stats
  this.name = name;
  this.health = 20;
  this.max_health = 20;

  this.skills = [
    Skill.HealthRegen(),
    Skill.QuickDraw(),
  ];
}
