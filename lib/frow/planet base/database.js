'use strict';
var core = require('../core/database');

exports.core = core;

// initialize types
// physical types
[
  'Starch', 'Plastic',
  'Ore', 'Metal',
].forEach(function(name) {
  core.add(new core.ResourceType({ name: name, physical: true, max: 1 }));
});

core.add(new core.ResourceType({ name: 'Power Collector (sm)', physical: false, max: 500 }));
core.add(new core.ResourceType({ name: 'Power Collector (md)', physical: false, max: 1000 }));
core.add(new core.ResourceType({ name: 'Power Collector (lg)', physical: false, max: 1500 }));
core.add(new core.ResourceType({ name: 'Power Collector (xl)', physical: false, max: 3000 }));
