'use strict';
var express = require('express');
var app = express();

app.use('/', express.static('dist'));
app.use('/rest/asym', require('./server/asym_proto'));

app.listen(3000);
