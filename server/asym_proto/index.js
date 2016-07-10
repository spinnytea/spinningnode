'use strict';
var _ = require('lodash');
/*
 * Asymmetric Prototype
 *
 * I just want to SEE it, and then maybe test out some ideas.
 */

var app = module.exports = require('express')();

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
