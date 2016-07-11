'use strict';
/*
 * Asymmetric Prototype
 *
 * I just want to SEE it, and then maybe test out some ideas.
 */

var _ = require('lodash');
var app = module.exports = require('express')();
app.use(require('body-parser').json()); // for parsing application/json

app.get('/ping', function(req, res) {
  res.sendStatus(204);
});

app.get('/players', function(req, res) {
  res.json(GAME_STATE.players);
});
app.get('/players/:name', function(req, res) {
  var player = _.find(GAME_STATE.players, {name: req.params.name});
  if(player)
    res.json(player);
  else
    res.sendStatus(404);
});
app.put('/players/:name', function(req, res) {
  // FIXME error handling
  var player = _.find(GAME_STATE.players, {name: req.params.name});
  var input = req.body; // FIXME sanitize input
  _.merge(player, input);
  res.sendStatus(203);
});

//

var GAME_STATE = {
  players: []
};

function createPlayer({name, color}) {
  GAME_STATE.players.push({
    name: name,
    color: color,
    x: GAME_STATE.players.length,
    y: 0
  });
}


// seed the game with a player (so we don't need to login and stuff)
createPlayer({name: 'red', color: '#F44336'});
createPlayer({name: 'yellow', color: '#FFEB3B'});
createPlayer({name: 'green', color: '#4CAF50'});
createPlayer({name: 'blue', color: '#2196F3'});
