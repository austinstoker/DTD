DTD.model = (function(components, graphics, input) {
    var map = components.Map({
      width:600,
      height:600
    });
    var toolBox = components.ToolBox({
      position: {x: 600, y:0},
      map: map
    });
    var mouse = input.Mouse(); 
    
    toolBox.addComponent(components.Tower_1);
    toolBox.addComponent(components.Tower_2);
    toolBox.addComponent(components.Tower_3);
    toolBox.addComponent(components.Tower_4);
    toolBox.addComponent(components.Tower_5);
    toolBox.addComponent(components.Tower_6);

    function update(elapsedTime) {
      map.update(elapsedTime);
      var creep = components.Creep_2({exitNumber:0});
      map.addCreep(creep);
      var creep3 = components.Creep_3({exitNumber:1});
      map.addCreep(creep3);
    }

    function render() {
        map.render();
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
}(DTD.components, DTD.graphics, DTD.input));