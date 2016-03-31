// This file is based on sample code by Dean Mathias 
// these samples are used by permission and were distributed for 
// USU CS5410 Game Development Spring 2016
// Code modifications by Austin Stoker and Kendall Spackman

/*global DTD */

DTD.pages['page-mainmenu'] = (function(screens) {

	function initialize() {
		//
		// Setup each of menu events for the screens
		document.getElementById('id-new-game').addEventListener(
			'click',
			function() {screens.showScreen('page-game'); });

		document.getElementById('id-high-scores').addEventListener(
			'click',
			function() { screens.showScreen('page-highscores'); });

		document.getElementById('id-about').addEventListener(
			'click',
			function() { screens.showScreen('page-about'); });
	}

	function run() {
		//
		// I know this is empty, there isn't anything to do.
	}

	return {
		initialize : initialize,
		run : run
	};
}(DTD.screens));
