DTD.model = (function(components, graphics, input, particles, localStorage) {
    var map = components.Map({
      width:600,
      height:600
    });
    var toolBox = components.ToolBox({
      position: {x: 600, y:0},
      map: map
    });
    var mouse = input.mouse;
    var keyboard = input.keyboard;
    
    toolBox.addComponent(components.Tower_Projectile);
    toolBox.addComponent(components.Tower_Slowing);
    toolBox.addComponent(components.Tower_Bomb);
    toolBox.addComponent(components.Tower_Missile);
    
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

    function gameLoop(elapsedTime) {
        update(elapsedTime);
        render();
        requestAnimationFrame(gameLoop);
    }

    function initialize() {
        mouse.registerCommand('mouseup',toolBox.handleClick);
        mouse.registerCommand('mouseup',map.handleMouseClick);
        mouse.registerCommand('mousemove',map.handleMouseMove);
        var l = localStorage.get();
        var sellKey = KeyEvent.DOM_VK_S;
        if(l.hasOwnProperty('Sell Tower')){
          sellKey = l['Sell Tower'];
        }
        var upgradeKey = KeyEvent.DOM_VK_U;
        if(l.hasOwnProperty('Upgrade Tower')){
          upgradeKey = l['Upgrade Tower'];
        }
        
        keyboard.registerConfigurableCommand('Sell Tower',sellKey, map.sellTower,false,false);
        keyboard.registerConfigurableCommand('Upgrade Tower',upgradeKey, map.upgradeTower,false,false);
        //requestAnimationFrame(gameLoop);
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
        processInput: processInput,
        update: update,
        render: render
    }
}(DTD.components, DTD.graphics, DTD.input, DTD.particles,DTD.localStorage));