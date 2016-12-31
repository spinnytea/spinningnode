'use strict';

// skills are unlocked through gameplay
// there are various prereqs (e.g. stats, quest giver, pilgrimage)
module.exports = Skill;

Skill.HealthRegen = function() { return new Skill('Health Regen', 'Regenerate when not at full health.', 50, Infinity); };
Skill.DetectPower = function() { return new Skill('Detect Power', 'Determine the strengths of a target.', 10, 30); };
Skill.QuickDraw = function() { return new Skill('Quick Draw', 'Draw your weapon in half the time.', 3000, 4, -1); };

function Skill(name, desc, step, max, level) {
  this.name = name;
  this.description = desc;
  // how many actions/points does it take to advance a level
  this.step = step;

  // current points towards next level
  this.curr = 0;
  // current skill level; used for checks
  this.level = (level === undefined?1:level);
  // highest level from previous lives
  this.prev_level = this.level;
  // max skill level
  this.max_level = max;
}

Skill.prototype.add = function(num) {
  if(this.maxed()) return;

  // increase the current value
  // if the current level is less than the max, then double the exp
  // XXX apply the amount in steps instead of all at once - don't double the value that extends beyond the previous
  // - (i.e. step = 1, previous = 3, level = 2, curr = 0; num = 50 - you shouldn't get 100 points, just 52)
  this.curr += (num || 1) * (this.prev_level > this.level ? 2 : 1);

  // when the current values spills over, update the level
  while(this.curr >= this.next()) {
    this.curr -= this.next();
    this.level++;
  }

  if(this.level >= this.max_level) {
    this.level = this.max_level;
    this.curr = 0;
  }
};

Skill.prototype.next = function() {
  return Math.max(this.level, 1) * this.step;
};

Skill.prototype.maxed = function() {
  return this.level === this.max_level;
};
