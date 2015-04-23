function randInt(max) {
  return Math.floor(Math.random()*max);
}

module.exports = {
  randInt: randInt,

  /** @return array for chaining */
  shuffle: function(array) {
    var copy = array.splice(0);

    while(copy.length)
      array.push(copy.splice(randInt(copy.length), 1)[0]);

    return array;
  },

  init: function(height, width) {
    var maze = [];
    while(maze.length < height) {
      var row = [];
      while(row.length < width)
        row.push({
          _east: undefined,
          _west: undefined,
          _north: undefined,
          _south: undefined,

          loc: {
            y: maze.length,
            x: row.length
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
    return maze;
  },
  getWalls: function(maze, y, x) {
    var walls = [];

    if(x < maze[0].length-1)
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