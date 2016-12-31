'use strict';

// skills are unlocked through gameplay
// there are various prereqs (e.g. stats, quest giver, pilgrimage)
module.exports = Skill;

Skill.HealthRegen = function() { return new Skill('Health Regen', 50); };
Skill.DetectPower = function() { return new Skill('Detect Power', 10); };

function Skill(name, step) {
  this.name = name;
  this.step = step;
  this.previous_level = 1;

  this.curr = 0;
  this.level = 1;
}

Skill.prototype.add = function(num) {
  // increase the current value
  // if the current level is less than the max, then double the exp
  // XXX apply the amount in steps instead of all at once - don't double the value that extends beyond the previous
  // - (i.e. step = 1, previous = 3, level = 2, curr = 0; num = 50 - you shouldn't get 100 points, just 52)
  this.curr += (num || 1) * (this.previous_level > this.level ? 2 : 1);

  // when the current values spills over, update the level
  while(this.curr >= this.next()) {
    this.curr -= this.next();
    this.level++;
  }
};

Skill.prototype.next = function() {
  return this.level * this.step;
};
