
DTD.components = (function(graphics) {

	//------------------------------------------------------------------
	//
	// Tests to see if two rectangles intersect.  If they do, true is returned,
	// false otherwise.
	// Adapted from: http://stackoverflow.com/questions/2752349/fast-rectangle-to-rectangle-intersection
	//
	//------------------------------------------------------------------
	function intersectRectangles(r1, r2) {
		return !(
			r2.left > r1.right ||
			r2.right < r1.left ||
			r2.top > r1.bottom ||
			r2.bottom < r1.top
		);
	}
  
  //------------------------------------------------------------------
	//
	// Tests to see if two rectangles intersect.  If they do, true is returned,
	// false otherwise.
	// Adapted from: http://stackoverflow.com/questions/2752349/fast-rectangle-to-rectangle-intersection
	//
	//------------------------------------------------------------------
	function overlapRectangles(r1, r2) {
		return (
			r2.left < r1.right &&
			r2.right > r1.left &&
			r2.top < r1.bottom &&
			r2.bottom > r1.top
		);
	}
  
  
  function intersectPoint(r, p) {
		return (
			p.x < r.right &&
			p.x > r.left &&
			p.y < r.bottom &&
			p.y > r.top
		);
	}
  
  
	//
	// Constants, as best as we can do them in JavaScript
	var Constants = {
    get TowerHeight() { return 40; },
    get TowerWidth() { return 40; },
	};
  
  function Texture(imageSrc) {
		var that = {},
			ready = false,
			image = new Image();
		
		// Load the image; override the draw function once it finished loading.
		image.onload = function() { 
            that.draw = function(spec) {
                graphics.drawImage(image, spec);
            };
		};
		image.src = imageSrc;
		
		// that.updateRotation = function(angle) {
		// 	spec.rotation += angle;
		// };
		
		that.draw = function() {
		};
		
		return that;
	}
  
  // ------------------------------------------------------------------
    //
    // This represents the model for a Tower.  It knows how to
    // render itself.
    //
    // 'spec' must include:
    //
    // ------------------------------------------------------------------
    function Tower(spec) {
        var that = {
            get left() { return spec.center.x - Constants.TowerWidth / 2 },
            get right() { return spec.center.x + Constants.TowerWidth / 2 },
            get top() { return spec.center.y - Constants.TowerHeight / 2 },
            get bottom() { return spec.center.y + Constants.TowerHeight / 2 },
            get center() { return spec.center },
      get rotation() { return spec.rotation },
      set centerX(value) { spec.center.x = value },
      set centerY(value) { spec.center.y = value },
      set validPosition(value) { validPosition = value},
      get validPosition() { return validPosition;},
      set highlight(value) {highlight = value;},
      get highlight() {return highlight;}
        },
        highlight = false,
            texture = Texture(spec.image),
            targetRotation = spec.rotation,
            rotateSpeed = spec.rotateSpeed,
            validPosition = true;
        
        that.placed = false;
        that.setRotationSpeed = function(speed){
          rotateSpeed = speed;
        }
        that.setRotation = function(rotation) {
            targetRotation = rotation%(2*Math.PI);
        }
        
        function updatePlacing(elapsedTime) {
            validPosition = true;
        }
        
        function updatePlaced(elapsedTime) {
          var diff = (targetRotation - spec.rotation)%(2*Math.PI);
          if(diff>Math.PI){
            diff = Math.PI-diff;
          }
          var step = Math.sign(diff)*Math.min(rotateSpeed*elapsedTime,Math.abs(diff));
          spec.rotation += step; 
        }

        function renderPlacing() {
            var squareFill;
            if (validPosition) {
                squareFill = 'rgba(0, 255, 0, 0.4)';
            }
            else {
                squareFill = 'rgba(255, 0, 0, 0.4)';
            }
            graphics.drawCircle({
                center: spec.center,
                radius: spec.radius,
                fill: 'rgba(200, 200, 200, 0.4)',
                stroke: 'rgba(150, 150, 150, 0.4)'
            });
            graphics.drawRectangle({
                x: spec.center.x - Constants.TowerWidth / 2,
                y: spec.center.y - Constants.TowerHeight / 2,
                width: Constants.TowerWidth,
                height: Constants.TowerHeight,
                fill: squareFill
            })
            texture.draw({
                center: spec.center,
                width: Constants.TowerWidth,
                height: Constants.TowerHeight,
                rotation: spec.rotation,
                opacity: 0.4
            });
        }
        
        function renderPlaced() {
          var f;
          if(highlight){
            f=spec.baseColor;
            
          }
          else {
            f='gray';
          }

          graphics.drawRectangle({
            x: spec.center.x-Constants.TowerWidth/2+1,
            y: spec.center.y-Constants.TowerHeight/2+1,
            width: Constants.TowerWidth-2,
            height: Constants.TowerHeight-2,
            stroke: spec.baseColor,
            fill: f,
            opacity: 0.4
          })
            texture.draw({
                center: spec.center,
                width: Constants.TowerWidth,
                height: Constants.TowerHeight,
                rotation: spec.rotation,
                opacity: 1
            });
        }
        
        function renderSelected() {
            graphics.drawCircle({
                center: spec.center,
                radius: spec.radius,
                fill: 'rgba(200, 200, 200, 0.4)',
                stroke: 'rgba(100, 100, 100, 1)'
            });
            renderPlaced();
        }

        that.update = updatePlacing;
        that.render = renderPlacing;
        
        that.place = function() {
            if (!that.placed && validPosition) {
                that.placed = true;
                that.render = renderPlaced;
                that.update = updatePlaced;
            }
        }
        
        that.select = function() {
            if (that.placed) {
                that.render = renderSelected;
            }
        }
        
        that.unselect = function() {
            if (that.placed) {
                that.render = renderPlaced;
            }
        }

        return that;
    }
    
    
    
  function ToolBox(spec){
    var components = [];
    var constructors = {};
    var that = {};
    var gap = 10;
    var nextY = spec.position.y+gap+Constants.TowerHeight/2;
    
    function getClickedToolIdx(x,y){
      for(var i = 0; i<components.length;i++){
        if(intersectPoint(components[i],{x:x,y:y})){
          return i;
        }
      }
      return undefined;
    }

    that.render = function(){
      for(var i = 0; i<components.length;i++){
        components[i].render();
      }
    }
    
    that.addComponent = function(constructor){
      var element = constructor();
      element.centerY = nextY;
      element.centerX = spec.position.x + gap + Constants.TowerWidth/2;
      nextY = element.bottom + gap + Constants.TowerHeight/2;
      element.place();
      components.push(element);
      var i = components.length;
      constructors[i-1] = constructor;
    }
    
    that.handleClick = function(event){
      var coords = graphics.relMouse(event);
      if(coords.x<spec.position.x){return;}
      var tool = getClickedToolIdx(coords.x,coords.y);
      var isCurTool = true;
      if(tool !==undefined){
        isCurTool = components[tool].highlight;
      }
      for(var i = 0; i<components.length;i++){
          components[i].highlight = false;
      }
      if(tool !==undefined&&isCurTool==false){
        spec.map.settowerInProgress(constructors[tool]);

        components[tool].highlight = true;
      }
      else{
        spec.map.settowerInProgress(function(){return undefined;});
      }
    }
    
    return that;
  }
  
  function Map(spec){
    var that = {};
    var objects = [];
    var towerInProgress = undefined;
    function newTowerConstructor(){};
    function internalClickHandler(){};
    function internalMoveHandler(){};
    
    function placeTower(pos){
      moveTower(pos);
      if(towerInProgress.validPosition){
        objects.push(towerInProgress);
        towerInProgress.place();
        towerInProgress = newTowerConstructor();
        moveTower(pos);
      }
    }
    
    function moveTower(pos){
      towerInProgress.centerX = pos.x;
      towerInProgress.centerY = pos.y;
      var isValidPosition = true;
      for(var i=0; i<objects.length; i++){
        if(overlapRectangles(objects[i],towerInProgress))
        {
          isValidPosition= false;
          break;
        }
      }
      towerInProgress.validPosition = isValidPosition;
    }
    
    
    function selectObject(pos){
      for(var i = 0; i<objects.length;i++){
        if(intersectPoint(objects[i],pos)){
          objects[i].select();
        }
        else{
          objects[i].unselect();
        }
      }
    }
    
    function snapToGrid(pos){
      var out = {};
      out.x = Math.round(pos.x/(Constants.TowerWidth/2))*Constants.TowerWidth/2
      out.y = Math.round(pos.y/(Constants.TowerHeight/2))*Constants.TowerHeight/2
      return out;
    }
    
    that.settowerInProgress = function(f){
      var v;
      if(f===newTowerConstructor){
        newTowerConstructor = function(){return undefined;}
      }
      else{
        newTowerConstructor=f;
      }
      
      v=newTowerConstructor();
      
      if(v !==undefined){
        towerInProgress = v;
        towerInProgress.centerX = -200;
        towerInProgress.centerY = -200;
        internalClickHandler = placeTower;
        internalMoveHandler = moveTower;
        for(var i = 0; i<objects.length;i++){
          objects[i].unselect();
        }
      }
      else{
        internalClickHandler = selectObject;
        internalMoveHandler = function(){};
      }
    }
    
    that.handleMouseClick = function(event){
      if(event)
      var pos = graphics.relMouse(event)
      if(pos.x>spec.width ||
         pos.x<0 ||
         pos.y<0 ||
         pos.y>spec.height){return;}
         
      pos = snapToGrid(pos);
      internalClickHandler(pos);
    }
    that.handleMouseMove = function(event){
      var pos = graphics.relMouse(event);
      if(pos.x>spec.width ||
         pos.x<0 ||
         pos.y<0 ||
         pos.y>spec.height){
           pos.x = -200;
           pos.y = -200;
         }
      pos = snapToGrid(pos);
      internalMoveHandler(pos);
    }
    
    that.update = function(elapsedTime){
      for(var i = 0; i<objects.length; i++)
      {
        objects[i].update(elapsedTime);
      }
    }
    
    that.render = function(){
      graphics.drawRectangle({x:1,
                              y:0,
                              width:spec.width,
                              height:spec.height,
                              fill:'grey',
                              stroke:'black'
                              });            
      for(var i = 0; i<objects.length;i++){
        objects[i].render();
      }
      if(towerInProgress!==undefined){
        towerInProgress.render();
      }  
    }

    
    return that;
  }

  function Tower_1(){
    var that = Tower({
      image: 'images/tower-defense-turrets/turret-1-1.png',
      baseColor: 'red',
      rotation: 0,
      center:{x:0,y:0},
      radius:50,
      rotateSpeed: 10
    });
    return that;
  }
  
  function Tower_2(){
    var that = Tower({
      image: 'images/tower-defense-turrets/turret-2-1.png',
      baseColor: 'orange',
      rotation:0,
      center:{x:0,y:0},
      radius:50,
      rotateSpeed: 10
    });
    return that;
  }
  
  function Tower_3(){
    var that = Tower({
      image: 'images/tower-defense-turrets/turret-3-1.png',
      baseColor: 'yellow',
      rotation:0,
      center:{x:0,y:0},
      radius:100,
      rotateSpeed: 10
    });
    return that;
  }
  function Tower_4(){
    var that = Tower({
      image: 'images/tower-defense-turrets/turret-4-1.png',
      baseColor: 'green',
      rotation:0,
      center:{x:0,y:0},
      radius:30,
      rotateSpeed: 10
    });
    return that;
  }
  function Tower_5(){
    var that = Tower({
      image: 'images/tower-defense-turrets/turret-5-1.png',
      baseColor: 'blue',
      rotation:0,
      center:{x:0,y:0},
      radius:40,
      rotateSpeed: 10
    });
    return that;
  }
  function Tower_6(){
    var that = Tower({
      image: 'images/tower-defense-turrets/turret-6-1.png',
      baseColor: 'purple',
      rotation:0,
      center:{x:0,y:0},
      radius:80,
      rotateSpeed: 10
    });
    return that;
  }


	return {
    Tower : Tower,
    Tower_1 : Tower_1,
    Tower_2 : Tower_2,
    Tower_3 : Tower_3,
    Tower_4 : Tower_4,
    Tower_5 : Tower_5,
    Tower_6 : Tower_6,
		Constants: Constants,
		Map : Map,
    ToolBox : ToolBox
	};
}(DTD.graphics));
