
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
    get GridHeight() { return 20; },
    get GridWidth() { return 20; },
    get CreepHeight() { return 20; },
    get CreepWidth() { return 20; },
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
    
    // ------------------------------------------------------------------
    //
    // This represents the model for a Creep.  It knows how to
    // render itself.
    //
    // 'spec' must include:
    //    center: x and y coordinates of the center of the creep
    //    width: creep width in pixels
    //    height: creep height in pixels
    //    rotation: creep rotation in radians
    //    rotateSpeed: speed of creep rotation in radians/second
    //    speed: creep speed in pixels/second
    //    image: relative path to image file for creep
    //    exitNumber: exit number to which creep should move
    //    
    // ------------------------------------------------------------------
    function Creep(spec) {
      var that = {
        get left() { return spec.center.x - spec.width / 2 },
        get right() { return spec.center.x + spec.width / 2 },
        get top() { return spec.center.y - spec.height / 2 },
        get bottom() { return spec.center.y + spec.height / 2 },
        get center() { return spec.center },
        get rotation() { return spec.rotation },
        set centerX(value) { spec.center.x = value },
        set centerY(value) { spec.center.y = value },
      },
      texture = Texture(spec.image),
      nextPoint,
      pathFunction;
      
      that.setPathFindingFunction = function(f) {
        pathFunction = f;
      }
      that.getExitNumber = function() {
        return spec.exitNumber;
      }
      
      that.update = function(elapsedTime) {
        if (elapsedTime < 0) {
          return;
        }
        nextPoint = pathFunction(spec.exitNumber, spec.center);
        console.log("current", spec.center);
        console.log("next", nextPoint);
          moveTo(nextPoint, elapsedTime);
      }
      
      function moveTo(point, elapsedTime) {
        if (spec.center.x !== point.x || spec.center.y !== point.y) {
          var direction = {
            x: point.x - spec.center.x,
            y: point.y - spec.center.y
          },
            length = Math.sqrt(direction.x * direction.x + direction.y * direction.y),
            normalized = {
              x: direction.x / length,
              y: direction.y / length
            },
            angle = Math.atan(-direction.y / direction.x);
          if (direction.x < 0) {
            angle += Math.PI;
          }
          
          if (Math.abs(spec.rotation - angle) < .00001) { // compare doubles with epsilon of .00001
            spec.center.x += Math.sign(direction.x) * Math.min(Math.abs(normalized.x * (spec.speed * (elapsedTime / 1000))), Math.abs(direction.x));
            spec.center.y += Math.sign(direction.y) * Math.min(Math.abs(normalized.y * (spec.speed * (elapsedTime / 1000))), Math.abs(direction.y));
            // if (spec.center.x === point.x && spec.center.y === point.y) {
            //   console.log("Arrived at point: " + point.x + ", " + point.y);
            // }
          }
          else {
            var diff = (angle - spec.rotation) % (2 * Math.PI);
            if(diff > Math.PI){
              diff = Math.PI - diff;
            }
            var step = Math.sign(diff) * Math.min(spec.rotateSpeed * (elapsedTime / 1000), Math.abs(diff));
            spec.rotation += step;
            if (spec.rotation < -Math.PI / 2) {
              spec.rotation += 2 * Math.PI;
            }
            else if (spec.rotation > 3 * Math.PI / 2) {
              spec.rotation -= 2 * Math.PI;
            }
            // if (Math.abs(spec.rotation - angle) < .00001) {
            //   console.log("Arrived at angle: " + (angle / Math.PI) + "*PI");
            // }
          }
        }
      }

      that.render = function() {
        texture.draw({
          center: spec.center,
          width: spec.width,
          height: spec.height,
          rotation: spec.rotation,
          opacity: 1
        });
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
    var towers = [];
    var creeps = [];
    var towerInProgress = undefined;
    var grid = [];
    var entrances = [];
    
    function newTowerConstructor(){};
    function internalClickHandler(){};
    function internalMoveHandler(){};
    
    function getCellsBlockedByTower(tower){
      var L = (tower.left/Constants.GridWidth);
      var R = (tower.right/Constants.GridWidth);
      var T = (tower.top/Constants.GridHeight);
      var B = (tower.bottom/Constants.GridHeight);
      var tests = [];
      for(var i=L; i<R; i++){
        for(var j=T; j<B; j++){
          tests.push({i:i,j:j});
        }
      }
      return tests;
    }
    
    function placeTower(pos){
      moveTower(pos);
      if(towerInProgress.validPosition){
        towers.push(towerInProgress);
        var blocked = getCellsBlockedByTower(towerInProgress);
        grid = updateShortestPaths(entrances[0].out,blocked);
        towerInProgress.place();
        towerInProgress = newTowerConstructor();
        moveTower(pos);
      }
    }
    
    function moveTower(pos){
      towerInProgress.centerX = pos.x;
      towerInProgress.centerY = pos.y;
      for(var i=0; i<towers.length; i++){
        if(overlapRectangles(towers[i],towerInProgress))
        {
          towerInProgress.validPosition= false;
          return;
        }
      }
      var tests = getCellsBlockedByTower(towerInProgress);
      tempGrid = updateShortestPaths(entrances[0].out,tests);
      if(tempGrid[entrances[0].in.i][entrances[0].in.j].d === 100000){
        towerInProgress.validPosition = false;
        return;
      }
      towerInProgress.validPosition = true;
    }
    
    function selectTower(pos){
      for(var i = 0; i<towers.length;i++){
        if(intersectPoint(towers[i],pos)){
          towers[i].select();
        }
        else{
          towers[i].unselect();
        }
      }
    }
    
    function toMapUnits(pos){
      var out = {};
      out.i = Math.round(pos.x/(Constants.GridWidth));
      out.j = Math.round(pos.y/(Constants.GridHeight));
      return out;
    }
    
    function toScreenUnits(pos){
      var out = {};
      out.x = pos.i*Constants.GridWidth;
      out.y = pos.j*Constants.GridHeight;
      return out;
    }
    
    function snapToGrid(pos){
      var mapPos = toMapUnits(pos);
      return toScreenUnits(mapPos);
    }
    
    that.addCreep = function(creep){
      var entrance = entrances[creep.getExitNumber()].in;
      var coords = toScreenUnits(entrance);
      creep.centerX = coords.x+Constants.CreepWidth/2;
      creep.centerY = coords.y+Constants.CreepHeight/2;
      creep.setPathFindingFunction(nextStepTowardExit);
      creeps.push(creep);
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
        for(var i = 0; i<towers.length;i++){
          towers[i].unselect();
        }
      }
      else{
        internalClickHandler = selectTower;
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
      for(var i = 0; i<towers.length; i++)
      {
        towers[i].update(elapsedTime);
      }
      for(var i = 0; i<creeps.length; i++)
      {
        creeps[i].update(elapsedTime);
      }
    }
    
    updateShortestPaths = function(endPoint,tests){
      var myGrid = [];
      myGrid = clearPaths(myGrid);
      var stack = [];
      var blocked = [];
      myGrid[endPoint.i][endPoint.j].d = 0;
      stack.push(endPoint);
      
      for(var i=0; i<towers.length;i++){
        blocked = getCellsBlockedByTower(towers[i]);
        block(blocked);
      }
      if(tests!==undefined){
        block(tests);
      }
      
      function block(cells){
        for(var b=0; b<cells.length;b++){
          var i = cells[b].i;
          var j = cells[b].j;
          if(myGrid.length>i&& i>=0){
            if(myGrid[i].length>j && j>=0){
              myGrid[i][j].d=undefined;
            }
          }
        }
      }
      
      function process(cur,i,j){
        var neighbor = myGrid[i][j];
        var current = myGrid[cur.i][cur.j];
        if(neighbor.d===undefined){
          neighbor.pre = cur;
          return;
        }
        if(current.d+1<neighbor.d){
            neighbor.d = current.d+1;
            neighbor.pre = cur;
            stack.push({i:i,j:j});
          }
      }
      
      var left;
      var right;
      var top;
      var bottom;
      
      while(stack.length>0){
        var cur = stack.pop();
        
        if(cur.i>0){
          process(cur,cur.i-1,cur.j);
        }
        if(cur.i<myGrid.length-1){
          process(cur, cur.i+1,cur.j);
        }
        if(cur.j>0){
          process(cur,cur.i,cur.j-1);
        }
        if(cur.j<myGrid[0].length-1){
          process(cur,cur.i,cur.j+1);
        }
      }
      return myGrid;
    }
    nextStepTowardExit = function(exitNumber, currentPosition){
      var pos = {x:currentPosition.x,
        y:currentPosition.y};
      pos.x-=Constants.GridWidth/2;
      pos.y-=Constants.GridHeight/2;
      var cur = toMapUnits(pos);
      var coord = grid[cur.i][cur.j].pre;
      if(coord===undefined) return currentPosition;
      var dest = toScreenUnits(coord);
      dest.x +=Constants.GridWidth/2;
      dest.y +=Constants.GridHeight/2;
      return dest;
    }
    
    that.render = function(){
      graphics.drawRectangle({x:1,
                              y:0,
                              width:spec.width,
                              height:spec.height,
                              fill:'grey',
                              stroke:'black'
                              });    
      for(var i = 0; i<spec.width/Constants.GridWidth;i++){
        for(var j = 0; j<spec.width/Constants.GridHeight;j++){
          var rspec = {
                x:i*Constants.GridWidth,
                y:j*Constants.GridHeight,
                width:Constants.GridWidth,
                height:Constants.GridHeight,
                fill:'rgba('+3*grid[i][j].d+',40,40,1)',
                stroke:'grey'
              };
          if(grid[i][j].d===undefined){
            rspec.fill = 'purple';
            rspec.stroke = 'red';
          }
          graphics.drawRectangle(rspec);
        }
      }        
      for(var i = 0; i<towers.length;i++){
        towers[i].render();
      }
      for(var i = 0; i<creeps.length;i++){
        creeps[i].render();
      }
      
      if(towerInProgress!==undefined){
        towerInProgress.render();
      }  
    }

    entrances.push({in:{i:0,j:14},out:{i:29, j:14}});
    entrances.push({in:{i:15,j:0},out:{i:15, j:29}});
    
    clearPaths = function(theGrid){
      for(var i=0; i<spec.width/Constants.GridWidth; i++){
        var gridLine = [];
        for(var j=0; j<spec.height/Constants.GridHeight; j++){
          if(theGrid[i] === undefined){
            gridLine[j] = {d:100000,
                           pre:undefined};
          }
          else{
            if(theGrid[i][j].d === undefined){
              gridLine[j] = theGrid[i][j];
            }else{
              gridLine[j] = {d:100000,
                           pre:undefined};
            }
          }
        }
        theGrid[i] = gridLine;
      }
      return theGrid;
    }
    
    grid = updateShortestPaths(entrances[0].out);
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
  
  function Creep_1(spec) {
    return Creep({
      image: 'images/creep/creep-1-blue/1.png',
      rotation: 0,
      center: {x:2,y:2},
      rotateSpeed: 40 / 4,
      width: Constants.CreepWidth,
      height: Constants.CreepHeight,
      exitNumber: spec.exitNumber,
      speed: 80
    });
  }
  
  function Creep_2(spec) {
    return Creep({
      image: 'images/creep/creep-2-green/1.png',
      rotation: 0,
      center: {x:2,y:2},
      rotateSpeed: 40 / 3,
      width: Constants.CreepWidth,
      height: Constants.CreepHeight,
      exitNumber: spec.exitNumber,
      speed: 100
    });
  }
  
  function Creep_3(spec) {
    return Creep({
      image: 'images/creep/creep-3-red/1.png',
      rotation: 0,
      center: {x:2,y:2},
      rotateSpeed: 40 / 2,
      width: Constants.CreepWidth,
      height: Constants.CreepHeight,
      exitNumber: spec.exitNumber,
      speed: 120
    });
  }


	return {
    Tower : Tower,
    Tower_1 : Tower_1,
    Tower_2 : Tower_2,
    Tower_3 : Tower_3,
    Tower_4 : Tower_4,
    Tower_5 : Tower_5,
    Tower_6 : Tower_6,
    Creep_1 : Creep_1,
    Creep_2 : Creep_2,
    Creep_3 : Creep_3,
		Constants: Constants,
		Map : Map,
    ToolBox : ToolBox
	};
}(DTD.graphics));
