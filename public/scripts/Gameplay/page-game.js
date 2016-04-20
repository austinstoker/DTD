// This file is based on sample code by Dean Mathias 
// these samples are used by permission and were distributed for 
// USU CS5410 Game Development Spring 2016
// Code modifications by Austin Stoker and Kendall Spackman

/*global DTD, console, KeyEvent, requestAnimationFrame, performance */

DTD.pages['page-game'] = (function(gameModel, screens, graphics, input) {
	var keyboard = input.keyboard,
		cancelNextRequest = false,
		lastTimeStamp = performance.now();

	//------------------------------------------------------------------
	//
	// All one-time game page initialization is performed here.
	function initialize() {
		console.log('game initializing...');

		keyboard.registerCommand(KeyEvent.DOM_VK_ESCAPE, function() {
			//
			// Stop the game loop by canceling the request for the next animation frame
			cancelNextRequest = true;
			//
			// Then, return to the main menu
			screens.showScreen('page-mainmenu');
		});
	}

	//------------------------------------------------------------------
	//
	// Input is procesed here.
	//
	//------------------------------------------------------------------
	function processInput(elapsedTime) {
		keyboard.update(elapsedTime);
		gameModel.processInput(elapsedTime);
	}

	//------------------------------------------------------------------
	//
	// The game model is updated here.
	//
	//------------------------------------------------------------------
	function update(elapsedTime) {
		gameModel.update(elapsedTime);
	}

	//------------------------------------------------------------------
	//
	// The game model is rendered here.
	//
	//------------------------------------------------------------------
	function render() {
		graphics.clear();
		gameModel.render();
	}

	//------------------------------------------------------------------
	//
	// This is the Game Loop function!
	//
	//------------------------------------------------------------------
	function gameLoop(time) {
		var elapsedTime = time - lastTimeStamp;

		processInput(elapsedTime);
		update(elapsedTime);
		lastTimeStamp = time;

		render();

		//
		// Cancel the next animation if the user has pressed the ESC key, returning them
		// to the main menu.
		if (!cancelNextRequest) {
			requestAnimationFrame(gameLoop);
		}
	}

	function run() {
		gameModel.initialize();
		lastTimeStamp = performance.now();
		//
		// Start the animation loop
		cancelNextRequest = false;
		requestAnimationFrame(gameLoop);
	}

	return {
		initialize : initialize,
		run : run
	};
}(DTD.model, DTD.screens, DTD.graphics, DTD.input));
