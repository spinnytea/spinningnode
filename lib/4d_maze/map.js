'use strict';

exports.Connection = Connection;
exports.Room = Room;
exports.Map = Map;

function Connection(forward, backward) {
  this.f = !!forward;
  this.b = !!backward;
}

function Room(dimensions) {
  this.d = [];
  while(this.d.length < (dimensions || 1))
    this.d.push(new Connection());
}

function Map() {
  this.rooms = [];

  function createBranch(rooms, widths, dimensions) {
    var width = widths.shift();
    var r;
    while(rooms.length < width) {
      rooms.push((r = []));
      if(widths.length === 1)
        createLeaf(r, widths[0], dimensions);
      else
        createBranch(r, widths.slice(0), dimensions);
    }
  }

  function createLeaf(rooms, width, dimensions) {
    while(rooms.length < width)
      rooms.push(new Room(dimensions));
  }

  if(arguments.length === 1) {
    createLeaf(this.rooms, arguments[0], 1);
  } else if(arguments.length) {
    createBranch(this.rooms, Array.from(arguments), arguments.length);
  }
}

Map.prototype.getRoom = function(coordinates) {
  var room = this.rooms;
  coordinates = coordinates.slice(0);
  while(coordinates.length)
    room = room[coordinates.shift()];
  return room;
};

Map.prototype.door = function(coordinates, dimension, forward) {
  var r1 = this.getRoom(coordinates);
  coordinates[dimension] += (forward?1:-1);
  var r2 = this.getRoom(coordinates);

  if(forward) {
    r1.d[dimension].f = true;
    r2.d[dimension].b = true;
  } else {
    r1.d[dimension].b = true;
    r2.d[dimension].f = true;
  }
};
