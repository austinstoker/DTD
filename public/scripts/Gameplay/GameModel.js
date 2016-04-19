DTD.model = (function(components, graphics, input, particles) {
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
        keyboard.registerConfigurableCommand('Sell Tower',KeyEvent.DOM_VK_S, map.sellTower,false,false);
        keyboard.registerConfigurableCommand('Upgrade Tower',KeyEvent.DOM_VK_U, map.upgradeTower,false,false);
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
}(DTD.components, DTD.graphics, DTD.input, DTD.particles));