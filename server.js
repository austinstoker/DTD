// This file is based on sample code by Dean Mathias 
// these samples are used by permission and were distributed for 
// USU CS5410 Game Development Spring 2016
// Code modifications by Austin Stoker and Kendall Spackman

var express = require('express'),
	http = require('http'),
	path = require('path'),
  scores = require('./public/routes/high-scores.js'),
	app = express();

//
// Define the port to use
app.set('port', 3000);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/scripts', express.static(__dirname + '/scripts'));

//
// Define the different routes we support
app.get('/', function(request, response) {
	response.sendFile('index.html');
});

app.get('/v1/scores', scores.all);
app.post('/v1/scores', scores.add);

//------------------------------------------------------------------
//
// Indicate any other api requests are not implemented
//
//------------------------------------------------------------------
app.all('/v1/*', function(request, response) {
	response.writeHead(501);
	response.end();
});

//
// Get the server created and listening for requests
http.createServer(app).listen(app.get('port'), function() {
	console.log('DTD server listening on port ' + app.get('port'));
});
