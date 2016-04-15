
DTD.components = (function(graphics,particles) {

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
  // Tests to see if two circles intersect.  If they do, true is returned,
  // false otherwise.
  // Adapted from: http://stackoverflow.com/questions/1736734/circle-circle-collision
  //
  //------------------------------------------------------------------
  function intersectCircles(c1, c2) {
    if (c1 === undefined || c2 === undefined) return false;
    return Math.pow(c1.center.x - c2.center.x, 2) + Math.pow(c1.center.y - c2.center.y, 2) <= Math.pow(c1.radius + c2.radius, 2);
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
  
  function intersectCirclePoint(c, p) {
    return Math.pow(c.center.x - p.center.x, 2) + Math.pow(c.center.y - p.center.y, 2) <= Math.pow(c.radius, 2);
  }
  
  //
  // Constants, as best as we can do them in JavaScript
  var Constants = {
    get GridHeight() { return 20; },
    get GridWidth() { return 20; },
    get CreepHeight() { return 40; },
    get CreepWidth() { return 40; },
    get TowerHeight() { return 40; },
    get TowerWidth() { return 40; },
    get GroundType() { return 'ground'; },
    get AirType() { return 'air'; },
    get MixedType() { return 'mixed'; }
  };

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
        get radius() { return spec.radius },
        get rotation() { return spec.rotation },
        set centerX(value) { spec.center.x = value },
        set centerY(value) { spec.center.y = value },
        set validPosition(value) { validPosition = value},
        get validPosition() { return validPosition;},
        set highlight(value) {highlight = value;},
        get highlight() {return highlight;},
        get type() { return spec.type; }
      },
        projectiles = [],
        highlight = false,
        texture = graphics.Texture(spec),
        targetRotation = spec.rotation,
        rotateSpeed = spec.rotateSpeed,
        validPosition = true,
        reloadTimeRemaining = 0,
        nearestCreepFunction,
        projectileCollisionFunction;
        // base = graphics.Texture({
        //   image: 'images/tower-defense-turrets/turret-base.gif',
        //   width: Constants.TowerWidth,
        //   height: Constants.TowerHeight,
        //   center: spec.center,
        //   rotation: 0,
        //   test: true
        // });
        
      that.placed = false;
      spec.width = Constants.TowerWidth;
      spec.height = Constants.TowerHeight;
      spec.opacity = 0.4;
      spec.targetCreep = undefined;
        
        that.setNearestCreepFunction = function(f) {
          nearestCreepFunction = f;
        }
        
        that.setProjectileCollisionFunction = function(f) {
          projectileCollisionFunction = f;
        }
        
        that.setRotationSpeed = function(speed){
          rotateSpeed = speed;
        }
        
        function updatePlacing(elapsedTime) {
          validPosition = true;
        }
        
        function updatePlaced(elapsedTime) {
          updateTarget();
          rotate(elapsedTime);
          reloadTimeRemaining -= elapsedTime;
          if (reloadTimeRemaining < 0) {
            reloadTimeRemaining = 0;
          }
          if (spec.targetCreep !== undefined && spec.rotation === targetRotation && reloadTimeRemaining === 0) {
            fire();
          }
          updateProjectiles(elapsedTime);
        }
        
        function updateTarget() {
          if (!intersectCircles(that, spec.targetCreep) || !spec.targetCreep.alive()) {
            // if (!intersectCircleRect(that, spec.targetCreep)) {
              if (nearestCreepFunction !== undefined) {
                var target = nearestCreepFunction(spec.center, spec.radius, spec.type);
                if (spec.targetCreep !== target) {
                  spec.targetCreep = target;
                }
              }
          //   }
          }
          updateTargetRotation();
        }
        
        function updateTargetRotation() {
          if (spec.targetCreep === undefined) {
            targetRotation = spec.rotation;
          } else {
            var targetPosition = spec.targetCreep.center,
              direction = {
                x: targetPosition.x - spec.center.x,
                y: targetPosition.y - spec.center.y
              };
            if (direction.x !== 0) {
              targetRotation = Math.atan(direction.y / direction.x);
              if (direction.x < 0) {
                targetRotation += Math.PI;
              }
              else if (targetRotation < 0) {
                targetRotation += 2 * Math.PI;
              }
            } else {
              targetRotation = Math.PI / 2;
            }
          }
        }
        
        function updateProjectiles(elapsedTime) {
          var removeMe = [];
          for (var i = 0; i < projectiles.length; i++) {
            projectiles[i].update(elapsedTime);
            if (projectiles[i].didHit || !intersectCirclePoint(that, projectiles[i])) {
              removeMe.push(i);
            }
          }
          
          for (var i = removeMe.length - 1; i >= 0; i--) {
            projectiles.splice(removeMe[i], 1);
          }
          removeMe.length = 0;
        }
        
        function rotate(elapsedTime) {
          var diff = (targetRotation - spec.rotation)%(2*Math.PI);
          if(diff>Math.PI){
            diff = Math.PI-diff;
          }
          var step = Math.sign(diff)*Math.min(rotateSpeed*elapsedTime/1000,Math.abs(diff));
          spec.rotation += step;
        }

        function fire() {
          var proj = that.createProjectile();
          proj.setCheckCollisionsFunction(projectileCollisionFunction);
          projectiles.push(proj);
          reloadTimeRemaining = spec.reloadTime * 1000;
        }
        
        // template method--must be overridden
        that.createProjectile = function() {}

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
          texture.draw();
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
          });
          // base.draw();
          for (var i = 0; i < projectiles.length; i++) {
            projectiles[i].render();
          }
          texture.draw();
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
            spec.opacity = 1;
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
    
    function Projectile(spec) {
      var that = {
        get center() { return spec.center },
        get damage() { return spec.damage },
        get x() { return spec.center.x; },
        get y() { return spec.center.y; },
        get radius() { return spec.damageRadius; },
        get freezePower() { return spec.freezePower; },
        get damageRadius() { return spec.damageRadius; },
        get type() { return spec.type; }
      },
        timeSincePuff = 0,
        puffSpacing = spec.puffSpace | 100;
        
      that.didHit = false;
      spec.checkCollisionsFunction = undefined;
      
      that.setCheckCollisionsFunction = function(f) {
        spec.checkCollisionsFunction = f;
      }
      
      that.update = function(elapsedTime) {
        spec.center.x += spec.direction.x * spec.speed * (elapsedTime / 1000);
        spec.center.y += spec.direction.y * spec.speed * (elapsedTime / 1000);
        timeSincePuff+=elapsedTime;
        if(timeSincePuff>puffSpacing)
        {
          timeSincePuff=0;
          particles.smokePuff({center:spec.center});
        }
        if (spec.checkCollisionsFunction !== undefined) {
          spec.checkCollisionsFunction(that);
        }
      }
      
      that.render = function() {
        graphics.drawCircle({
          x: spec.center.x,
          y: spec.center.y,
          radius: 3,
          fill: spec.fill
        })
      }
      
      that.hit = function() {
        that.didHit = true;
      }
      
      return that;
    }
    
    function GuidedProjectile(spec) {
      var that = Projectile(spec),
        direction = {
          x: 0,
          y: 0
        };
      calculateDirection();
      
      function calculateDirection() {
        direction.x = spec.targetCreep.center.x - spec.center.x;
        direction.y = spec.targetCreep.center.y - spec.center.y;
        var length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        direction.x /= length;
        direction.y /= length;
      }
      
      that.update = function(elapsedTime) {
        if (spec.targetCreep.alive()) {
          calculateDirection();
        }
        spec.center.x += direction.x * spec.speed * (elapsedTime / 1000);
        spec.center.y += direction.y * spec.speed * (elapsedTime / 1000);
        if (spec.checkCollisionsFunction !== undefined) {
          spec.checkCollisionsFunction(that);
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
    //    lifePoints: creep's starting life points
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
        get prevCenter() {return spec.prevCenter },
        get rotation() { return spec.rotation },
        set centerX(value) { spec.center.x = value },
        set centerY(value) { spec.center.y = value },
        get type() { return spec.type; },
        get radius() { return Math.min(spec.width, spec.height)/2; } // A tight radius, for a circle inscribed in the creep
      },
      sprite = graphics.SpriteSheet(spec),
      targetPosition = spec.center,
      targetRotation,
      pathFunction;
      spec.opacity = 1;
      spec.initialLifePoints = spec.lifePoints;
      
      that.hit = function(damage) {
        spec.lifePoints -= damage;
        if (spec.lifePoints <= 0) {
          spec.lifePoints = 0;
        }
      }
      
      that.slow = function(slowBy) {
        if(spec.speed > slowBy) {
          spec.speed -= slowBy;
        }
      }
      
      
      that.alive = function() {
        return spec.lifePoints > 0;
      }
      
      that.setPathFindingFunction = function(f) {
        pathFunction = f;
      }
      
      that.getExitNumber = function() {
        return spec.exitNumber;
      }
      
      that.update = function(elapsedTime) {
        var nextPoint, direction;

        if (elapsedTime < 0 || !that.alive()) {
          return;
        }
        sprite.update(elapsedTime, true);
        do {
          updateTargets();
          elapsedTime -= rotateAndMove(elapsedTime);
        } while (elapsedTime > 0);
      }
      
      function updateTargets() {
        nextPoint = pathFunction(spec.exitNumber, spec.center);
        if (nextPoint.x !== targetPosition.x || nextPoint.y !== targetPosition.y) {
          targetPosition = nextPoint;
          direction = {
            x: targetPosition.x - spec.center.x,
            y: targetPosition.y - spec.center.y
          }
          if (direction.x !== 0) {
            targetRotation = Math.atan(direction.y / direction.x);
            if (direction.x < 0) {
              targetRotation += Math.PI;
            }
            else if (targetRotation < 0) {
              targetRotation += 2 * Math.PI;
            }
          } else {
            targetRotation = Math.PI / 2;
          }
        }
      }
      
      // Returns the amount of time "spent" rotating and moving
      function rotateAndMove(elapsedTime) {
        spec.prevCenter=spec.center;
        if (spec.center.x !== targetPosition.x || spec.center.y !== targetPosition.y) {
          var direction, length, normalized,
            remainingTime = elapsedTime,
            remainingSecs = elapsedTime / 1000,
            diff = (targetRotation - spec.rotation) % (2 * Math.PI);
            
          if(diff > Math.PI){
            diff = Math.PI - diff;
          }
          
          if (Math.abs(diff) > .00001) { // compare doubles with epsilon of .00001
            var maxRotate = spec.rotateSpeed * remainingSecs;
            if (spec.rotateSpeed * remainingSecs < Math.abs(diff)) {
              spec.rotation += Math.sign(diff) * maxRotate;
              return elapsedTime;
            }
            else {
              spec.rotation += diff;
              remainingTime -= elapsedTime * ((maxRotate - Math.abs(diff)) / maxRotate);
              remainingSecs = remainingTime / 1000;
            }
            // if (Math.abs(spec.rotation - angle) < .00001) {
            //   console.log("Arrived at angle: " + (angle / Math.PI) + "*PI");
            // }
          }
          
          var maxDistance = spec.speed * remainingSecs;
          direction = {
            x: targetPosition.x - spec.center.x,
            y: targetPosition.y - spec.center.y
          };
          length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
          normalized = {
            x: direction.x / length,
            y: direction.y / length
          };
          if (maxDistance < length) {
            spec.center.x += normalized.x * maxDistance;
            spec.center.y += normalized.y * maxDistance;
            return elapsedTime;
          } else {
            spec.center.x += direction.x;
            spec.center.y += direction.y;
            remainingTime -= elapsedTime * ((maxDistance - length) / maxDistance);
            remainingSecs = remainingTime / 1000;
          }
          // if (spec.center.x === targetPosition.x && spec.center.y === targetPosition.y) {
          //   console.log("Arrived at point: " + targetPosition.x + ", " + targetPosition.y);
          // }
          return elapsedTime - remainingTime;
        }
      }

      that.render = function() {
        if (that.alive()) {
          var percentLife = spec.lifePoints / spec.initialLifePoints,
            greenWidth = spec.width * percentLife,
            redWidth = spec.width * (1 - percentLife);
          sprite.draw();
          graphics.drawRectangle({
            fill: 'rgba(0,255,0,1)',
            x: spec.center.x - spec.width / 2,
            y: spec.center.y - spec.height / 2 - 10,
            width: greenWidth,
            height: 4
          });
          graphics.drawRectangle({
            fill: 'rgba(255,0,0,1)',
            x: spec.center.x - spec.width / 2 + greenWidth,
            y: spec.center.y - spec.height / 2 - 10,
            width: redWidth,
            height: 4
          });
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
  
  function Cell(){
    var that = {};
    var creeps = [];
    
    that.addCreep = function(creep){
      creeps.push(creep);
    }
    
    that.checkCollsions = function(projectile){
      for(var i = 0; i< creeps.length; i++ ){
        var hit = intersectRectangles(projectile,creeps[i]);
        if(hit){
          creeps[i].hit(projectile.damage);
            creeps[i].slow(projectile.freezePower);
          projectile.hit();
          break;
        }
      }
    }
    
    that.removeCreep = function(creep){
      var idx= creeps.indexOf(creep);
      if(idx!==undefined){
        creeps.splice(idx);
      }
    }
  }
  
  function Map(spec){
    var that = {};
    var towers = [];
    var creeps = [];
    var towerInProgress = undefined;
    var grids = [];
    var cells = [];
    var entrances = [];
    var sumTime=0;
    
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
      isNewTowerPosValid();
      if(towerInProgress.validPosition){
        towers.push(towerInProgress);
        var blocked = getCellsBlockedByTower(towerInProgress);
        for(var e=0;e<entrances.length;e++){
          grids[e] = updateShortestPaths(entrances[e].out,blocked,entrances[e].air);
        }
        towerInProgress.place();
        towerInProgress.setNearestCreepFunction(getNearestCreep);
        towerInProgress.setProjectileCollisionFunction(checkCollisions);
        towerInProgress = newTowerConstructor();
        moveTower(pos);
      }
    }
    
    function isNewTowerPosValid(){
      //check collisions with other towers
      for(var i=0; i<towers.length; i++){
        if(overlapRectangles(towers[i],towerInProgress))
        {
          towerInProgress.validPosition= false;
          return;
        }
      }
      //check blocking creep paths
      for(var e=0;e<entrances.length;e++){
        var tests = getCellsBlockedByTower(towerInProgress);
        var tempGrid = updateShortestPaths(entrances[e].out,tests,entrances[e].air);
        if(tempGrid[entrances[e].in.i][entrances[e].in.j].d > 10000){
          towerInProgress.validPosition = false;
          return;
        }
        towerInProgress.validPosition = true;
      }
    }
    
    function moveTower(pos){
      if(towerInProgress.centerX === pos.x&&towerInProgress.centerY === pos.y) return;
      towerInProgress.centerX = pos.x;
      towerInProgress.centerY = pos.y;
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
    
    function dist2(pos1, pos2){
      return Math.pow((pos1.x-pos2.x),2)+Math.pow((pos1.y-pos2.y),2);
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
    
    function addCreep(creep){
      var entrance = entrances[creep.getExitNumber()].in;
      var coords = toScreenUnits(entrance);
      creep.centerX = coords.x+Constants.CreepWidth/2;
      creep.centerY = coords.y+Constants.CreepHeight/2;
      creep.setPathFindingFunction(nextStepTowardExit);
      creeps.push(creep);
    }
    
    function updateCreepCells(creep){
      var curCell = toMapUnits(creep.center);
      var prevCell = toMapUnits(creep.prevCenter);
      if(curCell.i===prevCell.i && curCell.j===prevCell.j){
        return;
      }
      for(var i= prevCell.i-1; i<=prevCell.i+1;i++){
        for(var j= prevCell.j-1; j<=prevCell.j+1;j++){
          cells[i][j].removeCreep(creep);
        }
      }
      for(var i= curCell.i-1; i<=curCell.i+1;i++){
        for(var j= curCell.j-1; j<=curCell.j+1;j++){
          cells[i][j].addCreep(creep);
        }
      }
    }
    
    that.addCreep = function(creep){
      addCreep(creep);
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
      //TODO This is just an easy way to add creeps at a reasonable rate
      // this should be replaced with something better when levels are implemented
      sumTime+=elapsedTime;
      if(sumTime>=2000){
        sumTime = -200000;
        addCreep(Creep_1({exitNumber:0}));
        addCreep(Creep_2({exitNumber:1}));
        addCreep(Creep_3({exitNumber:2})); //air
        addCreep(Creep_3({exitNumber:3})); //air
        
      }
      var toRemove=[];
      for(var i = 0; i<towers.length; i++)
      {
        towers[i].update(elapsedTime);
      }
      for(var i = 0; i<creeps.length; i++)
      {
        if(!creeps[i].alive())
        {
          particles.creepDeath({
            center: creeps[i].center
          });
          toRemove.push(i);
        }
        creeps[i].update(elapsedTime);
        updateCreepCells(creeps[i]);
      }
      for(var i = toRemove.length-1; i>=0;i--){
        creeps.splice(toRemove[i],1);
      }
    }
    
    function updateShortestPaths(endPoint,tests,isAir){
      var myGrid = [];
      myGrid = clearPaths(myGrid);
      var stack = [];
      var blocked = [];
      myGrid[endPoint.i][endPoint.j].d = 0;
      stack.push(endPoint);
      
      if(isAir===undefined||isAir===false){
        for(var i=0; i<towers.length;i++){
          blocked = getCellsBlockedByTower(towers[i]);
          block(blocked);
        }
        if(tests!==undefined){
          block(tests);
        }
      }
      
      function block(cells){
        for(var b=0; b<cells.length;b++){
          var i = cells[b].i;
          var j = cells[b].j;
          if(myGrid.length>i&& i>=0){
            if(myGrid[i].length>j && j>=0){
              myGrid[i][j].c=10000;
            }
          }
        }
      }
      
      function process(cur,i,j){
        var neighbor = myGrid[i][j];
        var current = myGrid[cur.i][cur.j];
        if(current.d+current.c<neighbor.d){
            neighbor.d = current.d+current.c;
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
    
    function nextStepTowardExit(exitNumber, currentPosition){
      var pos = {x:currentPosition.x,
        y:currentPosition.y};
      pos.x-=Constants.GridWidth/2;
      pos.y-=Constants.GridHeight/2;
      var cur = toMapUnits(pos);
      var coord = grids[exitNumber][cur.i][cur.j].pre;
      if(coord===undefined) return currentPosition;
      var dest = toScreenUnits(coord);
      dest.x +=Constants.GridWidth/2;
      dest.y +=Constants.GridHeight/2;
      return dest;
    }
    
    function getNearestCreep(center, radius, type) {
      //return creeps[0];
      //var location = toMapUnits(center);
      var nearestCreep = undefined;
      //var r = toMapUnits({x:radius,y:radius});
      for(var i = 0; i< creeps.length; i++){
        if (typesMatch(creeps[i], type)) {
          var oldDist = 100000;
          if(nearestCreep!==undefined){
            oldDist = dist2(center,nearestCreep.center);
          }
          var newDist = dist2(center,creeps[i].center);
          if(newDist < Math.pow(radius+Constants.CreepWidth,2) && newDist<oldDist){
            nearestCreep = creeps[i];
          }
        }
      }
      
      // for(var i = location.i-r.i; i<= location.i+r.i; i++ ){
      //   for(var j = location.j-r.j1; j<= location.j+r.j; j++ ){
      //     var creep = cells[i][j].getNearestCreep(center,radius);
      //     if(creep===undefined){continue;}
      //     if(nearestCreep===undefined){
      //       nearestCreep = creep;
      //     }
      //     intersectRectangles
      //     if(dist2(center,creep)<dist2(center,nearestCreep)){
      //       nearestCreep = creep;
      //     }
      //   }
      // }
      return nearestCreep;
    }
    
    function typesMatch(creep, type) {
      return creep.type === type || type === Constants.MixedType;
    }
    
    function checkCollisions(projectile){
      // var location = toMapUnits(projectile.center);
      // for(var i = location.i-1; i<= location.i+1; i++ ){
      //   for(var j = location.j-1; j<= location.j+1; j++ ){
      //     cells[i][j].checkCollsions(projectile);
      //   }
      // }

      for(var i = 0; i< creeps.length; i++ ){
        var hit = intersectCirclePoint(creeps[i], projectile);
        if(hit && typesMatch(creeps[i], projectile.type)){
          creeps[i].hit(projectile.damage);
          if (projectile.freezePower !== undefined) {
            creeps[i].slow(projectile.freezePower);
          }
          if (projectile.damageRadius !== undefined) {
            for(var j = 0; j < creeps.length; j++) {
              if (intersectCircles(creeps[j], projectile) && typesMatch(creeps[j], projectile.type) && i !== j) {
                creeps[j].hit(projectile.damage);
              }
            }
          } 
          projectile.hit();
          break;
        }
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
      for(var i = 0; i<spec.width/Constants.GridWidth;i++){
        for(var j = 0; j<spec.width/Constants.GridHeight;j++){
          var rspec = {
                x:i*Constants.GridWidth,
                y:j*Constants.GridHeight,
                width:Constants.GridWidth,
                height:Constants.GridHeight,
                fill:'rgba(200,200,200,.1)',
                stroke:'grey'
              };
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

    entrances.push({in:{i:0,j:14},out:{i:29, j:14},air:false});
    entrances.push({in:{i:15,j:0},out:{i:15, j:29},air:false});
    
    entrances.push({in:{i:0,j:14},out:{i:29, j:14},air:true});
    entrances.push({in:{i:15,j:0},out:{i:15, j:29},air:true});
    
    function clearPaths(theGrid){
      for(var i=0; i<spec.width/Constants.GridWidth; i++){
        var gridLine = [];
        for(var j=0; j<spec.height/Constants.GridHeight; j++){
          if(theGrid[i] === undefined){
            gridLine[j] = {d:1000000,
                           c:1,
                           pre:undefined};
          }
          else{
            if(theGrid[i][j].c >=10000){
              gridLine[j] = theGrid[i][j];
            }else{
              gridLine[j] = {d:1000000,
                             c:1,
                             pre:undefined};
            }
          }
        }
        theGrid[i] = gridLine;
      }
      return theGrid;
    }
    
    grids.length = 0;
    for(var e=0;e<entrances.length;e++){
      grids.push(updateShortestPaths(entrances[e].out,entrances[e].air));
    }
    
    cells.length = 0;
    for(var i= 0; i<=spec.width/Constants.GridWidth;i++){
      var row = []
      for(var j= 0; j<=spec.height/Constants.GridHeight;j++){
        row.push(Cell());
      }
      cells.push(row);
    }
    
    return that;
  }
  
  function Tower_Projectile(){
    var spec = {
      image: 'images/tower-defense-turrets/turret-2-1.png',
      baseColor: 'rgba(79,6,39,1)',
      rotation: 3 * Math.PI / 2,
      center:{x:0,y:0},
      radius: 50,
      rotateSpeed: Math.PI / 4,
      reloadTime: 0.5,
      fill: 'black',
      projectileSpeed: 100,
      damage: 10,
      type: Constants.MixedType
    };
    var that = Tower(spec);
    
    that.createProjectile = function() {
      return Projectile({
        center: {
          x: spec.center.x,
          y: spec.center.y
        },
        speed: spec.projectileSpeed,
        direction: {
          x: Math.cos(spec.rotation),
          y: Math.sin(spec.rotation)
        },
        damage: spec.damage,
        fill: spec.fill,
        type: spec.type
      });
    }
    return that;
  }

  function Tower_Slowing(){
    var spec = {
      image: 'images/tower-defense-turrets/turret-1-1.png',
      baseColor: 'rgba(3,216,226,1)',
      rotation: 3 * Math.PI / 2,
      center:{x:0,y:0},
      radius: 50,
      rotateSpeed: Math.PI / 4,
      reloadTime: 0.5,
      fill: 'blue',
      freezePower: 0.5,
      projectileSpeed: 75,
      damage: 2,
      type: Constants.GroundType
    };
    var that = Tower(spec);
    
    that.createProjectile = function() {
      return Projectile({
        center: {
          x: spec.center.x,
          y: spec.center.y
        },
        speed: spec.projectileSpeed,
        direction: {
          x: Math.cos(spec.rotation),
          y: Math.sin(spec.rotation)
        },
        damage: spec.damage,
        fill: spec.fill,
        freezePower: spec.freezePower,
        type: spec.type
      });
    }
    return that;
  }
  
  function Tower_Bomb(){
    var spec = {
      image: 'images/tower-defense-turrets/turret-7-1.png',
      baseColor: 'rgba(255,84,0,1)',
      rotation: 3 * Math.PI / 2,
      center:{x:0,y:0},
      radius: 80,
      rotateSpeed: Math.PI / 4,
      reloadTime: 1.5,
      damageRadius: 20,
      fill: 'red',
      projectileSpeed: 50,
      damage: 40,
      type: Constants.GroundType
    };
    var that = Tower(spec);
        
    that.createProjectile = function() {
      return Projectile({
        center: {
          x: spec.center.x,
          y: spec.center.y
        },
        speed: spec.projectileSpeed,
        direction: {
          x: Math.cos(spec.rotation),
          y: Math.sin(spec.rotation)
        },
        damage: spec.damage,
        fill: spec.fill,
        damageRadius: spec.damageRadius,
        type: spec.type
      });
    }
    
    return that;
  }
  
  function Tower_Missile(){
    var spec = {
      image: 'images/tower-defense-turrets/turret-5-1.png',
      baseColor: 'rgba(27,248,26,1)',
      rotation: 3 * Math.PI / 2,
      center:{x:0,y:0},
      radius: 40,
      rotateSpeed: Math.PI / 4,
      reloadTime: 1,
      fill: 'green',
      projectileSpeed: 75,
      damage: 30,
      type: Constants.AirType
    }
    var that = Tower(spec);
    
    that.createProjectile = function() {
      return GuidedProjectile({
        center: {
          x: spec.center.x,
          y: spec.center.y
        },
        speed: spec.projectileSpeed,
        direction: {
          x: Math.cos(spec.rotation),
          y: Math.sin(spec.rotation)
        },
        damage: spec.damage,
        fill: spec.fill,
        targetCreep: spec.targetCreep,
        type: spec.type
      });
    }
    
    return that;
  }
  
  function Creep_1(spec) {
    return Creep({
      spriteSheet: 'images/creep/creep-1-blue/spriteSheet.png',
      rotation: 0,
      center: {x:2,y:2},
      rotateSpeed: Math.PI / 2,
      width: Constants.CreepWidth,
      height: Constants.CreepHeight,
      lifePoints: 40,
      exitNumber: spec.exitNumber,
      speed: 40,
      spriteCount: 6,
      spriteTime: [ 1000, 200, 100, 1000, 100, 200 ],
      type: (spec.exitNumber < 2) ? Constants.GroundType : Constants.AirType
    });
  }
  
  function Creep_2(spec) {
    return Creep({
      spriteSheet: 'images/creep/creep-2-green/spriteSheet.png',
      rotation: 0,
      center: {x:2,y:2},
      rotateSpeed: Math.PI / 3,
      width: Constants.CreepWidth,
      height: Constants.CreepHeight,
      lifePoints: 35,
      exitNumber: spec.exitNumber,
      speed: 50,
      spriteCount: 4,
      spriteTime: [ 200, 1000, 200, 600 ],
      type: (spec.exitNumber < 2) ? Constants.GroundType : Constants.AirType
    });
  }
  
  function Creep_3(spec) {
    return Creep({
      spriteSheet: 'images/creep/creep-3-red/spriteSheet.png',
      rotation: Math.PI / 2,
      center: {x:2,y:2},
      rotateSpeed: Math.PI / 4,
      width: Constants.CreepWidth,
      height: Constants.CreepHeight,
      lifePoints: 30,
      exitNumber: spec.exitNumber,
      speed: 60,
      spriteCount: 4,
      spriteTime: [ 1000, 200, 200, 200 ],
      type: (spec.exitNumber < 2) ? Constants.GroundType : Constants.AirType
    });
  }


  return {
    Tower : Tower,
    Tower_Slowing : Tower_Slowing,
    Tower_Projectile : Tower_Projectile,
    Tower_Missile : Tower_Missile,
    Tower_Bomb : Tower_Bomb,
    Creep_1 : Creep_1,
    Creep_2 : Creep_2,
    Creep_3 : Creep_3,
    Constants: Constants,
    Map : Map,
    ToolBox : ToolBox
  };
}(DTD.graphics, DTD.particles));
