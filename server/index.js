'use strict';
var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World')
});

app.use('/asym', require('./asym_proto'));

app.listen(3000);
