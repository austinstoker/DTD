// This file is based on sample code by Dean Mathias 
// these samples are used by permission and were distributed for 
// USU CS5410 Game Development Spring 2016
// Code modifications by Austin Stoker and Kendall Spackman

/*global DTD */

DTD.pages['page-about'] = (function(screens) {

	function initialize() {
		document.getElementById('id-about-back').addEventListener(
			'click',
			function() { screens.showScreen('page-mainmenu'); });
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
