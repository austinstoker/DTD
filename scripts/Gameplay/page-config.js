// This file is based on sample code by Dean Mathias 
// these samples are used by permission and were distributed for 
// USU CS5410 Game Development Spring 2016
// Code modifications by Austin Stoker and Kendall Spackman

/*global DTD */

DTD.pages['page-config'] = (function(screens) {
  var keyboard = DTD.input.keyboard;
	function initialize() {
		document.getElementById('id-config-back').addEventListener(
			'click',
			function() { screens.showScreen('page-mainmenu'); });
	}

 function DisplayBindings() {
    var commands = keyboard.listConfigurableCommands();
    var configHTML = document.getElementById('key-bindings-list');
    configHTML.innerHTML = '';
    for(var i=0;i<commands.length;i++) {
			configHTML.innerHTML += (commands[i].name + ': ' +commands[i].binding +'<ul class = "config"><li><button id = "config_button_'+i+'">Edit</button></li></ul>');
		  var configButton = document.getElementById('config_button_'+i);
      configButton.addEventListener(
			'click',
			function() { keyboard.rebind(commands[i].name)});
    };
	}
  
	function run() {
		DisplayBindings();
	}

	return {
		initialize : initialize,
		run : run
	};
}(DTD.screens));
