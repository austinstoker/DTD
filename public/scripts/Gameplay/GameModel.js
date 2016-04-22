DTD.model = (function(components, graphics, input, particles, localStorage, audio) {
    var map = components.Map({
      width:600,
      height:600
    }),
    toolBox = components.ToolBox({
      position: {x: 600, y:0},
      map: map
    }),
    mouse = input.mouse,
    keyboard = input.keyboard,
    sellKey,
    upgradeKey,
    startKey;
    
    toolBox.addTower(components.Tower_Projectile);
    toolBox.addTower(components.Tower_Slowing);
    toolBox.addTower(components.Tower_Bomb);
    toolBox.addTower(components.Tower_Missile);
    toolBox.addClickableComponent(components.SoundController({
      center: {x:0, y:0},
      toggleFunction: audio.toggleMute,
      images: ['images/sounds.png', 'images/sounds_mute.png']
    }));
    toolBox.addClickableComponent(components.SoundController({
      center: {x:0, y:0},
      toggleFunction: audio.toggleMusic,
      images: ['images/music.png', 'images/music_mute.png']
    }));
    
    function update(elapsedTime) {
      elapsedTime = Math.min(elapsedTime,200);
      map.update(elapsedTime);
      particles.update(elapsedTime);
    }

    function render() {
        map.render();
        particles.render();
        toolBox.render();
    }

    function initialize() {
      audio.setMusicFile('audio/music.mp3');
      audio.playMusic();
      mouse.registerCommand('mouseup',toolBox.handleClick);
      mouse.registerCommand('mouseup',map.handleMouseClick);
      mouse.registerCommand('mousemove',map.handleMouseMove);
      var l = localStorage.get();
      sellKey = KeyEvent.DOM_VK_S;
      if(l.hasOwnProperty('Sell Tower')){
        sellKey = l['Sell Tower'];
      }
      upgradeKey = KeyEvent.DOM_VK_U;
      if(l.hasOwnProperty('Upgrade Tower')){
        upgradeKey = l['Upgrade Tower'];
      }
      startKey = KeyEvent.DOM_VK_G;
      if(l.hasOwnProperty('Start Level')){
        startKey = l['Start Level'];
      }
      
      keyboard.registerConfigurableCommand('Sell Tower',sellKey, map.sellTower,false,false);
      keyboard.registerConfigurableCommand('Upgrade Tower',upgradeKey, map.upgradeTower,false,false);
      keyboard.registerConfigurableCommand('Start Level',startKey, map.startLevel,false,false);
    }
    
    function pause() {
      cancelNextRequest = true;
      audio.stopMusic();
      mouse.unregisterCommand('mouseup',toolBox.handleClick);
      mouse.unregisterCommand('mouseup',map.handleMouseClick);
      mouse.unregisterCommand('mousemove',map.handleMouseMove);
      keyboard.unregisterConfigurableCommand('Sell Tower',sellKey, map.sellTower,false,false);
      keyboard.unregisterConfigurableCommand('Upgrade Tower',upgradeKey, map.upgradeTower,false,false);
      keyboard.unregisterConfigurableCommand('Start Level',startKey, map.startLevel,false,false);
    }
  //------------------------------------------------------------------
	//
	// Handle any keyboard input
	//
	//------------------------------------------------------------------
	function processInput(elapsedTime) {
		mouse.update(elapsedTime);
	}
  
    return {
        initialize: initialize,
        pause: pause,
        processInput: processInput,
        update: update,
        render: render
    }
}(DTD.components, DTD.graphics, DTD.input, DTD.particles,DTD.localStorage,DTD.audio));