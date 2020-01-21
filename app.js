var express = require('express'),
    http = require('http');


var app = express(),
    server = http.createServer(app),
    port = process.env.PORT || 8000;


app.use('/', express.static('public'));

server.listen(port);

console.log(`Server started on port ${port}`);
