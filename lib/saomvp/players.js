'use strict';
var Skill = require('./skills');

module.exports = Player;

function Player(name) {
  this.name = name;

  this.equipment = {
    // head
    face: null,
    helm: null,
    neck: null,

    // middle
    torso: null,
    back: null,
    hand_left: null,
    hand_right: null,

    // lower
    legs: null,
    leg_left: null,
    leg_right: null,
    foot_left: null,
    foot_right: null,
  };

  this.stats = {
    health: 20,
    max_health: 20,
  };

  this.skills = [
    // filled with starting skills
    Skill.HealthRegen(),
    Skill.QuickDraw(),
  ];
}
