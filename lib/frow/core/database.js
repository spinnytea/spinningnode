'use strict';

/* ugly function for adding things into the database */
exports.add = function addDatabaseObject(obj) {
  if(typeof obj !== 'object')
    throw new Error('invalid database object');

  switch(obj.constructor) {
    case Resource:
      exports.resources[obj.id] = obj;
      break;
    case ResourceType:
      exports.resource_types[obj.name] = obj;
      break;
    default:
      throw new Error('unknown type: ' + obj.constructor.name);
  }
};

/**
 * Resources
 */
exports.resources = {};
exports.Resource = Resource;
function Resource(config) {
  this.id = Resource.nextId++;
  this.type = config.type;
  this.location = config.location;
  this.amount = config.amount || 1;
}
Resource.nextId = 0;

/**
 * Resource Types
 * they contain the description of a resource
 */
exports.resource_types = {};
exports.ResourceType = ResourceType;
function ResourceType(config) {
  this.name = config.name;
  this.physical = !!config.physical;
  this.max = config.max;
}
