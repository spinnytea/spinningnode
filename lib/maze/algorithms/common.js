module.exports = {
  init: function(height, width) {
    var maze = [];
    while(maze.length < height) {
      var row = [];
      while(row.length < width)
        row.push({
          _east: undefined,
          _west: undefined,
          _north: undefined,
          _south: undefined
        });
      maze.push(row);
    }
    return maze;
  }
};