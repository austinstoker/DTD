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
    
    AssetManager.loadImage('slowing-1', 'images/tower-defense-turrets/turret-1-1.png');
    AssetManager.loadImage('slowing-2', 'images/tower-defense-turrets/turret-1-2.png');
    AssetManager.loadImage('slowing-3', 'images/tower-defense-turrets/turret-1-3.png');
    AssetManager.loadImage('projectile-1', 'images/tower-defense-turrets/turret-2-1.png');
    AssetManager.loadImage('projectile-2', 'images/tower-defense-turrets/turret-2-2.png');
    AssetManager.loadImage('projectile-3', 'images/tower-defense-turrets/turret-2-3.png');
    AssetManager.loadImage('missile-1', 'images/tower-defense-turrets/turret-5-1.png');
    AssetManager.loadImage('missile-2', 'images/tower-defense-turrets/turret-5-2.png');
    AssetManager.loadImage('missile-3', 'images/tower-defense-turrets/turret-5-3.png');
    AssetManager.loadImage('bomb-1', 'images/tower-defense-turrets/turret-7-1.png');
    AssetManager.loadImage('bomb-2', 'images/tower-defense-turrets/turret-7-2.png');
    AssetManager.loadImage('bomb-3', 'images/tower-defense-turrets/turret-7-3.png');
    AssetManager.loadImage('images/tower-defense-turrets/turret-base.gif');
    AssetManager.loadImage('images/creep/creep-1-blue/spriteSheet.png');
    AssetManager.loadImage('images/creep/creep-2-green/spriteSheet.png');
    AssetManager.loadImage('images/creep/creep-3-red/spriteSheet.png');
    
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