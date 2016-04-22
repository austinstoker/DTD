// This file is based on sample code by Dean Mathias 
// these samples are used by permission and were distributed for 
// USU CS5410 Game Development Spring 2016
// Code modifications by Austin Stoker and Kendall Spackman

var creeps = [0, 0, 0, 0, 0];
var towerValues = [0, 0, 0, 0, 0];

//------------------------------------------------------------------
//
// Report all scores back to the requester.
//
//------------------------------------------------------------------
exports.all = function(request, response) {
	console.log('get all scores called');
	response.writeHead(200, {'content-type': 'application/json'});
	response.end(JSON.stringify({creeps: creeps, towerValues: towerValues}));
};

//------------------------------------------------------------------
//
// Add a new score to the server data.
//
//------------------------------------------------------------------
exports.add = function(request, response) {
	console.log('add new score called');

  creeps.push(request.query.creeps);
  creeps.sort(function(a, b) {
		return b - a;
  });
  if (creeps.length > 5) {
		creeps.pop();
  }
	
	towerValues.push(request.query.towersval);
  towerValues.sort(function(a, b) {
		return b - a;
  });
  if (towerValues.length > 5) {
		towerValues.pop();
  }

	response.writeHead(200);
	response.end();
};
