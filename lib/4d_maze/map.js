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

