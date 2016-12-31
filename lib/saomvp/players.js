'use strict';
var _ = require('lodash');
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

  // current player skills
  this.skills = {};

  // when you die, save the level of all your skills
  // when you get them again, apply the value for the bonus
  this.max_skills = {};

  this.defaultSkills();
  this.storeSkillMax();
}

Player.prototype.defaultSkills = function() {
  this.addSkill(Skill.HealthRegen());
  this.addSkill(Skill.QuickDraw());
};

Player.prototype.storeSkillMax = function() {
  var ms = this.max_skills;
  _.forEach(this.skills, function(s) {
    if(s.name in ms) {
      ms[s.name] = Math.max(s.level, ms[s.name]);
    } else {
      ms[s.name] = s.level;
    }
  });
};

Player.prototype.addSkill = function(s) {
  if(s.name in this.max_skills)
    s.prev_level = this.max_skills[s.name];
  this.skills[s.name] = s;
};
