// This file is based on sample code by Dean Mathias 
// these samples are used by permission and were distributed for 
// USU CS5410 Game Development Spring 2016
// Code modifications by Austin Stoker and Kendall Spackman

/*global DTD */

DTD.pages['page-highscores'] = (function(screens) {

	function initialize() {
		document.getElementById('id-high-scores-back').addEventListener(
			'click',
			function() {
				screens.showScreen('page-mainmenu'); 
			});
	}

	function displayScores() {
		DTD.HighScores.get(displayCallback);
	}
	
	function displayCallback(highScores) {
		var creepScoresHTML = document.getElementById('creep-scores-list'),
			towerScoresHTML = document.getElementById('tower-scores-list');

		//
		// Clear whatever was already in the display
		creepScoresHTML.innerHTML = '';
		towerScoresHTML.innerHTML = '';
		//
		// Grab the previously saved high scores and get them displayed
		highScores.creeps.forEach(function (score) {
			creepScoresHTML.innerHTML += ('<li>' + score + '</li>');
		});
		highScores.towerValues.forEach(function (score) {
			towerScoresHTML.innerHTML += (score + '<br/>');
		});
	}

	function run() {
		displayScores();
	}

	return {
		initialize : initialize,
		run : run,
		displayScores : displayScores
	};
}(DTD.screens));
