'use strict';
module.exports = {
  GENERATION_TIMEOUT: 10,
  init: function(height, width) {
    var maze = [];
    while(maze.length < height) {
      var row = [];
      while(row.length < width)
        row.push({
          y: maze.length,
          x: row.length,

          _east: undefined,
          _west: undefined,
          _north: undefined,
          _south: undefined,

          dynamic: {
            player: false,
            visited: false,
            goal: -1
          },

          get inmaze () { return this._east !== undefined || this._west !== undefined || this._north !== undefined || this._south !== undefined; },

          connect: function(dir, to) {
            switch(dir) {
              case '_east':
                this._east = to;
                to._west = this;
                break;
              case '_west':
                this._west = to;
                to._east = this;
                break;
              case '_north':
                this._north = to;
                to._south = this;
                break;
              case '_south':
                this._south = to;
                to._north = this;
                break;
            }
          }
        });
      maze.push(row);
    }
    maze.eachCell = function(callback) {
      maze.forEach(function(row) {
        row.forEach(function(cell) {
          callback(cell);
        });
      });
    };
    return maze;
  },
  getWalls: function(maze, y, x) {
    var walls = [];

    if(x < maze[y].length-1)
      walls.push({ from: maze[y][x], to: maze[y][x+1], dir: '_east' });
    if(x > 0)
      walls.push({ from: maze[y][x], to: maze[y][x-1], dir: '_west' });
    if(y > 0)
      walls.push({ from: maze[y][x], to: maze[y-1][x], dir: '_north' });
    if(y < maze.length-1)
      walls.push({ from: maze[y][x], to: maze[y+1][x], dir: '_south' });

    return walls;
  }
};