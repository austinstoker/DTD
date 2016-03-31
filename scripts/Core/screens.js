// This file is based on sample code by Dean Mathias 
// these samples are used by permission and were distributed for 
// USU CS5410 Game Development Spring 2016
// Code modifications by Austin Stoker and Kendall Spackman

/*global DTD */

// ------------------------------------------------------------------
//
// This provides the code for screen management
//
// ------------------------------------------------------------------
DTD.screens = (function(pages) {

	//------------------------------------------------------------------
	//
	// This function is used to change to a new active screen.
	//
	//------------------------------------------------------------------
	function showScreen(id) {
		var screen = 0,
			active = null;
		//
		// Remove the active state from all screens.  There should only be one...
		active = document.getElementsByClassName('active');
		for (screen = 0; screen < active.length; screen += 1) {
			active[screen].classList.remove('active');
		}
		//
		// Tell the screen to start actively running
		pages[id].run();
		//
		// Then, set the new screen to be active
		document.getElementById(id).classList.add('active');
	}

	//------------------------------------------------------------------
	//
	// This function performs the one-time game initialization.
	//
	//------------------------------------------------------------------
	function initialize() {
		var screen = null;
		//
		// Go through each of the screens and tell them to initialize
		for (screen in pages) {
			if (pages.hasOwnProperty(screen)) {
				pages[screen].initialize();
			}
		}

		//
		// Make the main-menu screen the active one
		showScreen('page-mainmenu');
	}

	return {
		initialize : initialize,
		showScreen : showScreen
	};
}(DTD.pages));
