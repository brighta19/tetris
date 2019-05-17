var express = require('express'),
    http = require('http');


var app = express();
var server = http.createServer(app);


app.use('/', express.static('public'));

server.listen(process.env.PORT || 8000);

console.log('Server started. (' + __dirname + ')\n');
