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
    
    function editFun(e) { 
      var name = e.srcElement.name;
      keyboard.rebind(name);
      keyboard.onRebind(function(){
        var localStorage = DTD.localStorage;
        var binding = keyboard.getBinding(name);
        var l = localStorage.get();
        l[name] = binding;
        localStorage.set(l);
        DisplayBindings();
      })
    }
    function getOrDefault(name,def){
      var localStorage = DTD.localStorage;
      var l = localStorage.get();
      if(l.hasOwnProperty(name)){
        if(l[name]!==undefined){
          return keyboard.keyToString(l[name]);
        }
      }
      var useAlt = false;
      var useCtrl = false;
      l[name] = def;
      if(def>10000){
        def-=10000
        useAlt=true;
      }
      if(def>1000){
        def-=1000
        useCtrl=true;
      }
      keyboard.registerConfigurableCommand(name,def,function(){},useCtrl,useAlt);
      return keyboard.keyToString(def);
    }
    var SellTowerKey = getOrDefault("Sell Tower",KeyEvent.DOM_VK_S+1000);
    configHTML.innerHTML += ('Sell Tower: '+SellTowerKey+' <button name = "Sell Tower" id = "sellBindButton">Edit</button></br>');
    var UpgradeKey = getOrDefault("Upgrade Tower",KeyEvent.DOM_VK_U+1000);
    configHTML.innerHTML += ('Upgrade Tower: '+UpgradeKey+' <button name = "Upgrade Tower" id = "upgradeBindButton">Edit</button></br>');
    var StartLevelKey = getOrDefault("Start Level",KeyEvent.DOM_VK_G+1000);
    configHTML.innerHTML += ('Start Level: '+StartLevelKey+' <button name = "Start Level" id = "startBindButton">Edit</button></br>');
    
    var configButton = document.getElementById('sellBindButton');
    configButton.addEventListener('click',editFun);
    configButton = document.getElementById('upgradeBindButton');
    configButton.addEventListener('click',editFun);
    configButton = document.getElementById('startBindButton');
    configButton.addEventListener('click',editFun);
    
	}
  
  
	function run() {
		DisplayBindings();
	}

	return {
		initialize : initialize,
		run : run
	};
}(DTD.screens));