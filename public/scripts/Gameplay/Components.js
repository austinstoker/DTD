
DTD.components = (function(graphics,particles,highscores,audio) {

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
    get CreepHeight() { return 30; },
    get CreepWidth() { return 30; },
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
        get damage() {return spec.damage[spec.level] ||"";},
        get nextDamage() {return spec.damage[spec.level+1]||"";},
        get freezePower() {return that.createProjectile().freezePower||"";},
        get type() { return spec.type; },
        get cost() {return spec.cost[spec.level];},
        get upgradeCost() { return spec.cost[spec.level + 1]; },
        get refund() {return spec.refund[spec.level];},
        get towerValue() { return towerValue; },
        get isTower() {return true;}
      },
        projectiles = [],
        selected = false,
        highlight = false,
        texture,
        targetRotation = spec.rotation,
        rotateSpeed = spec.rotateSpeed,
        validPosition = 'yes',
        reloadTimeRemaining = 0,
        nearestCreepFunction,
        projectileCollisionFunction,
        towerValue = 0;
        
      that.placed = false;
      spec.width = Constants.TowerWidth;
      spec.height = Constants.TowerHeight;
      spec.opacity = 0.4;
      spec.targetCreep = undefined;
      spec.level = 0;
      spec.imageSrc = spec.imageSrcBase + spec.level + '.png';
      texture = graphics.Texture(spec);
        
        that.setNearestCreepFunction = function(f) {
          nearestCreepFunction = f;
        }
        
        that.setProjectileCollisionFunction = function(f) {
          projectileCollisionFunction = f;
        }
        
        that.setRotationSpeed = function(speed){
          rotateSpeed = speed;
        }
        
        that.canUpgrade = function() {
          return spec.level < 2;
        }
        
        that.upgrade = function() {
          if (spec.level < 2) {
            spec.level++;
            towerValue += spec.cost[spec.level];
            spec.imageSrc = spec.imageSrcBase + spec.level + '.png';
            texture = graphics.Texture(spec);
          }
        }
        
        function updatePlacing(elapsedTime) {
          validPosition = 'yes';
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
            if (nearestCreepFunction !== undefined) {
              var target = nearestCreepFunction(spec.center, spec.radius, spec.type);
              if (spec.targetCreep !== target) {
                spec.targetCreep = target;
              }
            }
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
          if (spec.audio !== undefined) {
            audio.play(spec.audio);
          }
        }
        
        // template method--must be overridden
        that.createProjectile = function() {}

        function renderPlacing() {
          var squareFill = 'rgba(200, 200, 200, 0.4)';
          if (validPosition==='yes') {
            squareFill = 'rgba(0, 255, 0, 0.4)';
          }
          else if (validPosition ==='no'){
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
          
          texture.draw();
        }
        that.renderProjectiles = function(){
          for (var i = 0; i < projectiles.length; i++) {
            projectiles[i].render();
          }
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
          if (!that.placed && validPosition==='yes') {
            that.placed = true;
            that.render = renderPlaced;
            that.update = updatePlaced;
            spec.opacity = 1;
            towerValue += spec.cost[0];
          }
        }
        
        that.isSelected = function(){
          return selected;
        }
        that.select = function() {
          if (that.placed) {
           that.render = renderSelected;
           selected = true;
          }
        }
        
        that.unselect = function() {
          if (that.placed) {
            that.render = renderPlaced;
            selected = false;
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
        puffSpacing = spec.puffSpace | 5000/spec.speed;
        
      that.didHit = false;
      spec.checkCollisionsFunction = undefined;
      
      that.setCheckCollisionsFunction = function(f) {
        spec.checkCollisionsFunction = f;
      }
      
      that.updateSmoke = function(elapsedTime){
        timeSincePuff+=elapsedTime;
        if(timeSincePuff>puffSpacing)
        {
          timeSincePuff=0;
          particles.smokePuff({center:spec.center});
        }
      }
      
      that.update = function(elapsedTime) {
        spec.center.x += spec.direction.x * spec.speed * (elapsedTime / 1000);
        spec.center.y += spec.direction.y * spec.speed * (elapsedTime / 1000);
        that.updateSmoke(elapsedTime);
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
        if(spec.targetCreep===undefined ){return;}
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
        that.updateSmoke(elapsedTime);
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
        set rotation(value) {spec.rotation = value },
        set centerX(value) { spec.center.x = value },
        set centerY(value) { spec.center.y = value },
        get type() { return spec.type; },
        get value() {return spec.value; },
        get escaped() {return spec.escaped || false;},
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
      
      that.setExitNumber = function(val){
        spec.exitNumber = val;
      }
      
      that.update = function(elapsedTime) {


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
        var nextPoint, direction;
        nextPoint = pathFunction(spec.exitNumber, spec.center);
        var nextNextPoint = pathFunction(spec.exitNumber, nextPoint);
        if(nextPoint.x===nextNextPoint.x&&
           Math.abs(nextPoint.x-spec.center.x)<1&&
        nextPoint.y===nextNextPoint.y&&
        Math.abs(nextPoint.y-spec.center.y)<1){
          spec.escaped = true; 
          spec.lifePoints = 0;
        }
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

    function renderToolSpecs(){
      var tool;
      var inProgress = spec.map.getTowerInProgress();
      var selected = spec.map.getSelectedTower();
      var damage;
      var pos2 = {
          x:components[0].right,
          y:components[0].top
        } 
      if(inProgress !== undefined){
        tool = inProgress;
        damage = tool.damage;
      }
      else if(selected !==undefined){
        tool = selected;
        damage = tool.nextDamage;
      }
      
      else{ return;}
      
      graphics.drawText({
        fill: 'green',
        stroke: 'green',
        font:'20px Arial',
        text:'Cost: '+tool.cost,
        position:pos2,
        hjustify:'left',
        vjustify:'top'
      });

      graphics.drawText({
        fill: 'black',
        stroke: 'black',
        font:'20px Arial',
        text:'Radius: '+tool.radius,
        position:{x:pos2.x,y:pos2.y+20},
        hjustify:'left',
        vjustify:'top'
      });
      
      graphics.drawText({
        fill: 'red',
        stroke: 'red',
        font:'20px Arial',
        text:'Damage: '+damage,
        position:{x:pos2.x,y:pos2.y+40},
        hjustify:'left',
        vjustify:'top'
      });
      
      graphics.drawText({
        fill: 'blue',
        stroke: 'blue',
        font:'20px Arial',
        text:'Chill: '+tool.freezePower,
        position:{x:pos2.x,y:pos2.y+60},
        hjustify:'left',
        vjustify:'top'
      });
      
      graphics.drawText({
        fill: 'purple',
        stroke: 'purple',
        font:'20px Arial',
        text:'Upgrade: '+tool.upgradeCost||"",
        position:{x:pos2.x,y:pos2.y+80},
        hjustify:'left',
        vjustify:'top'
      });
      
      graphics.drawText({
        fill: 'black',
        stroke: 'black',
        font:'20px Arial',
        text:'Type: '+tool.type,
        position:{x:pos2.x,y:pos2.y+100},
        hjustify:'left',
        vjustify:'top'
      });
    }
  
    that.render = function(){
      for(var i = 0; i<components.length;i++){
        components[i].render();
      }
      var pos = {
        x:components[components.length-1].left,
        y:components[components.length-1].bottom
        }
      
      renderToolSpecs();
      
      graphics.drawText({
        fill: 'green',
        stroke: 'green',
        font:'20px Arial',
        text:'Cash: '+spec.map.cash,
        position:pos,
        hjustify:'left',
        vjustify:'top'
      });
      graphics.drawText({
        fill: 'red',
        stroke: 'red',
        font:'20px Arial',
        text:'Lives: '+spec.map.lives,
        position:{x:pos.x,y:pos.y+20},
        hjustify:'left',
        vjustify:'top'
      });
      graphics.drawText({
        fill: 'black',
        stroke: 'black',
        font:'20px Arial',
        text:'Creeps Killed: '+spec.map.creepsKilled,
        position:{x:pos.x,y:pos.y+40},
        hjustify:'left',
        vjustify:'top'
      });
      graphics.drawText({
        fill: 'black',
        stroke: 'black',
        font:'20px Arial',
        text:'Total Tower Value: '+spec.map.totalTowerValue,
        position:{x:pos.x,y:pos.y+60},
        hjustify:'left',
        vjustify:'top'
      });
    }
    
    that.addTower = function(constructor){
      var element = constructor();
      element.centerY = nextY;
      element.centerX = spec.position.x + gap + Constants.TowerWidth/2;
      nextY = element.bottom + gap + Constants.TowerHeight/2;
      element.place();
      components.push(element);
      var i = components.length;
      constructors[i-1] = constructor;
    }
    
    that.addClickableComponent = function(component) {
      component.centerY = nextY;
      component.centerX = spec.position.x + gap + Constants.TowerWidth/2;
      nextY = component.bottom + gap + Constants.TowerHeight/2;
      components.push(component);
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
        if(components[tool].isTower) {
          spec.map.settowerInProgress(constructors[tool]);

          components[tool].highlight = true;
        } else {
          components[tool].handleClick(event);
        }
      }
      else{
        spec.map.settowerInProgress(function(){return undefined;});
      }
    }
    
    return that;
  }
  
  function Wave(spec){
    var that = {
      get isDone(){return isDone;}
    };
    var creeps = [];
    var timeToNextCreep = 0;
    var count =0;
    var isDone=false;
    that.addCreep = function(creep){
      creeps.push(creep);
    }
    
    function getNextCreep(){
      if(isDone){return undefined;}
      
      var idx = Math.floor(Math.random()*creeps.length);
      var creep = creeps[idx]({exitNumber:spec.exitNum});
      
      if(count>=spec.numCreeps){
        isDone = true;
      }
      count++;
      return creep;
    }
    
    function getNextTime(){
      return Random.nextGaussian(spec.averageTime,spec.stdDev);
    }
    
    that.getCreep = function(){
      if(timeToNextCreep<0){
        count++;
        timeToNextCreep = getNextTime();
        return getNextCreep();
      }
      return undefined;
    }
    
    that.update = function(elapsedTime){
      timeToNextCreep-=elapsedTime;
    }
    return that;
  }
  
  function Level(spec){
    var that = {
      get entrances() {return spec.entrances;},
      get isDone() {return isDone;}
    };
    var curWave = 0;
    var isDone = false;
    
    
    that.update = function(elapsedTime){
      for(var wave in spec.waves){
        spec.waves[wave].update(elapsedTime);
      }
    }
    
    that.getCreep = function(){
      if(spec.waves[curWave].isDone){
        if(curWave>=spec.waves.length-1){
          isDone = true;
          return undefined;
        }
        else{
          curWave++;
        }
        
      }
      return spec.waves[curWave].getCreep();
    }
    return that;
  }
  
  function makeLevel(){
    var wave1 = Wave({numCreeps:20,averageTime: 1000,stdDev:200});
    wave1.addCreep(Creep_1);
    
    var wave2 = Wave({numCreeps:50,averageTime: 200,stdDev:200});
    wave2.addCreep(Creep_1);
    wave2.addCreep(Creep_2);
    wave2.addCreep(Creep_3);
    
    var wave3 = Wave({numCreeps:2,averageTime: 6000,stdDev:200});
    wave2.addCreep(Creep_1);
    wave2.addCreep(Creep_2);
    wave2.addCreep(Creep_3);
    
    var entrances = [];
    entrances.push({in:{i:0,j:12,w:1,h:5,a:0},out:{i:29, j:12,w:1,h:5},type:Constants.GroundType});
    entrances.push({in:{i:12,j:0,w:5,h:1,a:Math.PI/2},out:{i:12, j:29,w:5,h:1},type:Constants.GroundType});
    
    entrances.push({in:{i:0,j:12,w:1,h:5,a:0},out:{i:29, j:12,w:1,h:5},type:Constants.AirType});
    entrances.push({in:{i:12,j:0,w:5,h:1,a:Math.PI/2},out:{i:12, j:29,w:5,h:1},type:Constants.AirType});
    
    var level = Level({waves:[wave1,wave2],entrances:entrances});
    return level;
  }
  
  function makeLevel2(){
    var wave1 = Wave({numCreeps:20,averageTime: 1000,stdDev:200});
    wave1.addCreep(Creep_1);
    
    var wave2 = Wave({numCreeps:50,averageTime: 200,stdDev:200});
    wave2.addCreep(Creep_1);
    wave2.addCreep(Creep_2);
    wave2.addCreep(Creep_3);
    
    var wave3 = Wave({numCreeps:2,averageTime: 6000,stdDev:200});
    wave2.addCreep(Creep_1);
    wave2.addCreep(Creep_2);
    wave2.addCreep(Creep_3);
    
    var entrances = [];
    entrances.push({in:{i:0,j:12,w:1,h:5,a:0},out:{i:29, j:12,w:1,h:5},type:Constants.GroundType});
    entrances.push({in:{i:12,j:0,w:5,h:1,a:Math.PI/2},out:{i:12, j:29,w:5,h:1},type:Constants.GroundType});
    entrances.push({in:{i:4,j:0,w:5,h:1,a:Math.PI/2},out:{i:4, j:29,w:5,h:1},type:Constants.GroundType});
    
    entrances.push({in:{i:0,j:12,w:1,h:5,a:0},out:{i:29, j:12,w:1,h:5},type:Constants.AirType});
    entrances.push({in:{i:12,j:0,w:5,h:1,a:Math.PI/2},out:{i:12, j:29,w:5,h:1},type:Constants.AirType});
    
    var level = Level({waves:[wave1,wave2],entrances:entrances});
    return level;
  }
  
  function makeLevel3(){
    var wave1 = Wave({numCreeps:20,averageTime: 1000,stdDev:200});
    wave1.addCreep(Creep_1);
    
    var wave2 = Wave({numCreeps:50,averageTime: 200,stdDev:200});
    wave2.addCreep(Creep_1);
    wave2.addCreep(Creep_2);
    wave2.addCreep(Creep_3);
    
    var wave3 = Wave({numCreeps:2,averageTime: 6000,stdDev:200});
    wave3.addCreep(Creep_1);
    wave3.addCreep(Creep_2);
    wave3.addCreep(Creep_3);
    
    var entrances = [];
    entrances.push({in:{i:0,j:12,w:1,h:5,a:0},out:{i:29, j:12,w:1,h:5},type:Constants.GroundType});
    entrances.push({in:{i:12,j:0,w:5,h:1,a:Math.PI/2},out:{i:12, j:29,w:5,h:1},type:Constants.GroundType});
    entrances.push({in:{i:4,j:0,w:5,h:1,a:Math.PI/2},out:{i:4, j:29,w:5,h:1},type:Constants.GroundType});
    entrances.push({in:{i:20,j:0,w:5,h:1,a:Math.PI/2},out:{i:20, j:29,w:5,h:1},type:Constants.GroundType});
    
    entrances.push({in:{i:0,j:12,w:1,h:5,a:0},out:{i:29, j:12,w:1,h:5},type:Constants.AirType});
    entrances.push({in:{i:12,j:0,w:5,h:1,a:Math.PI/2},out:{i:12, j:29,w:5,h:1},type:Constants.AirType});
    entrances.push({in:{i:4,j:0,w:5,h:1,a:Math.PI/2},out:{i:4, j:29,w:5,h:1},type:Constants.AirType});
    entrances.push({in:{i:20,j:0,w:5,h:1,a:Math.PI/2},out:{i:20, j:29,w:5,h:1},type:Constants.AirType});
    
    var level = Level({waves:[wave1,wave2],entrances:entrances});
    return level;
  }
  
  
  function Map(spec){
    var that = {
      get creepsKilled() {return creepsKilled;},
      get totalTowerValue() {return totalTowerValue;},
      get scores() {return { creepsKilled: creepsKilled, totalTowerValue: totalTowerValue}; },
      get cash() {return cash;},
      get lives() {return lives;}
    };
    var towers = [];
    var creeps = [];
    var towerInProgress = undefined;
    var grids = [];
    var entrances = [];
    var creepsKilled=0;
    var totalTowerValue=0;
    var cash=100;
    var lives=10;
    var curLevel = -1;
    var levels = [makeLevel(),makeLevel2(),makeLevel3()];
    var levelComplete = true;
    var gameOver = false;
    
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
      if(cash<towerInProgress.cost) return;
      moveTower(pos);
      isNewTowerPosValid();
      if(towerInProgress.validPosition==='yes'){
        cash-=towerInProgress.cost;
        totalTowerValue += towerInProgress.cost;
        towers.push(towerInProgress);
        var blocked = getCellsBlockedByTower(towerInProgress);
        for(var e=0;e<entrances.length;e++){
          grids[e] = updateShortestPaths(entrances[e],blocked);
        }
        towerInProgress.place();
        towerInProgress.setNearestCreepFunction(getNearestCreep);
        towerInProgress.setProjectileCollisionFunction(checkCollisions);
        towerInProgress = newTowerConstructor();
        moveTower(pos);
      }
    }
    
    function isNewTowerPosValid(){
      //check touching entrance squares
      var blocks = getCellsBlockedByTower(towerInProgress);
      for(var cell in blocks){
        if(isEntrance(blocks[cell].i,blocks[cell].j)){
          towerInProgress.validPosition='no'; 
          return;
        }
      }
      
      //check collisions with other towers
      for(var i=0; i<towers.length; i++){
        if(overlapRectangles(towers[i],towerInProgress))
        {
          towerInProgress.validPosition= 'no';
          return;
        }
      }
      
      //check blocking creep paths
      for(var e=0;e<entrances.length;e++){
        var tests = getCellsBlockedByTower(towerInProgress);
        var tempGrid = updateShortestPaths(entrances[e],tests);
        if(tempGrid[entrances[e].in.i][entrances[e].in.j].d > 10000){
          towerInProgress.validPosition = 'no';
          return;
        }
        towerInProgress.validPosition = 'yes';
      }
    }
    
    function moveTower(pos){
      if(towerInProgress.centerX === pos.x&&towerInProgress.centerY === pos.y) return;
      towerInProgress.validPosition = 'maybe';
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
      var exitNumber = creep.getExitNumber();
      if(exitNumber===undefined){
        exitNumber = Math.floor(Math.random()*entrances.length);
        while(creep.type !== entrances[exitNumber].type){
          exitNumber = Math.floor(Math.random()*entrances.length);
        }
        creep.setExitNumber(exitNumber);
      }
      var entrance = entrances[creep.getExitNumber()].in;
      var coords = toScreenUnits({
        i:entrance.i+Math.floor(Math.random()*(entrance.w-1)),
        j:entrance.j+Math.floor(Math.random()*(entrance.h-1)),
      });
      var next = nextStepTowardExit(creep.getExitNumber(),coords);
      creep.centerX = next.x;
      creep.centerY = next.y;
      creep.rotation = entrance.a;
      creep.setPathFindingFunction(nextStepTowardExit);
      creeps.push(creep);
    }
    
    function endGame() {
      console.log('Ending game');
      gameOver = true;
      highscores.add(that.scores);
      audio.stopMusic();
      that.update = updateEnd;
    }
    
    that.startLevel = function(){
      if(!levelComplete){return;}
      if(curLevel>=levels.length-1){
        return;
      }
      levelComplete = false;
      curLevel++;
      entrances = levels[curLevel].entrances;
      grids.length = 0;
      for(var e=0;e<entrances.length;e++){
        grids.push(updateShortestPaths(entrances[e]));
      }
    }
    
    that.addCreep = function(creep){
      addCreep(creep);
    }
    
    that.getTowerInProgress = function(){
      return newTowerConstructor();
    }
    
    that.getSelectedTower = function(){
      for(var i = towers.length-1; i>=0; i--)
      {
        if(towers[i].isSelected()===true){
          return towers[i];
        }
      }
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
    
    that.sellTower = function(){
      for(var i = towers.length-1; i>=0; i--)
      {
        if(towers[i].isSelected()===true){
          cash+=towers[i].refund;
          totalTowerValue -= towers[i].towerValue;
          particles.createFloatingNumberEffect({
            position:towers[i].center,
            text:'+'+towers[i].refund
          });
          towers.splice(i,1);
          audio.play('audio/sell.wav');
        }
      }
    }
    
    that.upgradeTower = function() {
      for(var i = towers.length-1; i>=0; i--)
      {
        if(towers[i].isSelected()===true){
          if (towers[i].canUpgrade() && cash >= towers[i].upgradeCost) {
            cash -= towers[i].upgradeCost;
            totalTowerValue += towers[i].upgradeCost;
            towers[i].upgrade();
          }
        }
      }
    }
    
    function updatePlaying(elapsedTime){
      if(curLevel>-1){
        levels[curLevel].update(elapsedTime);
        var newCreep = levels[curLevel].getCreep();
        if(newCreep===undefined){
          if(levels[curLevel].isDone && creeps.length===0){
            levelComplete = true;
            if(curLevel<levels.length-1){
              entrances = levels[curLevel+1].entrances;
              grids.length = 0;
              for(var e=0;e<entrances.length;e++){
                grids.push(updateShortestPaths(entrances[e]));
              }
            }
            else {
              endGame();
            }
          }
        }
        else{
          addCreep(newCreep);
        }
      }
      
      var toRemove=[];
      for(var i = 0; i<towers.length; i++)
      {
        towers[i].update(elapsedTime);
      }
      for(var i = 0; i<creeps.length; i++)
      {
        if(creeps[i].escaped){
          lives-=1;
          if(lives<1){
            endGame();
          }
          particles.creepEscape({
            center: creeps[i].center
          });
          toRemove.push(i);
        }
        if(!creeps[i].alive() && !creeps[i].escaped)
        {
          particles.creepDeath({
            center: creeps[i].center
          });
          particles.createFloatingNumberEffect({
            position:creeps[i].center,
            text:'+'+creeps[i].value
          });
          audio.play('audio/death.wav');
          creepsKilled++;
          cash+=creeps[i].value;
          toRemove.push(i);
        }
        
        creeps[i].update(elapsedTime);
      }
      for(var i = toRemove.length-1; i>=0;i--){
        creeps.splice(toRemove[i],1);
      }
    }
    
    function updateEnd() {}
    
    that.update = updatePlaying;
    
    function updateShortestPaths(entrance,tests){
      var myGrid = [];
      myGrid = clearPaths(myGrid);
      var isAir = entrance.type===Constants.AirType;
      var stack = [];
      var blocked = [];
      for(var a = 0; a<entrance.out.w; a++){
        for(var b = 0; b<entrance.out.h; b++){
          myGrid[entrance.out.i+a][entrance.out.j+b].d = 0;
          stack.push({i:entrance.out.i+a,j:entrance.out.j+b});
        }
      }
      
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
      var nearestCreep = undefined;
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
      return nearestCreep;
    }
    
    function typesMatch(creep, type) {
      return creep.type === type || type === Constants.MixedType;
    }
    
    function checkCollisions(projectile){
      for(var i = 0; i< creeps.length; i++ ){
        var hit = intersectCirclePoint(creeps[i], projectile);
        if(hit && typesMatch(creeps[i], projectile.type)){
          creeps[i].hit(projectile.damage);
          particles.darkPuff({center:projectile.center});
          if (projectile.freezePower !== undefined) {
            creeps[i].slow(projectile.freezePower);
          }
          if (projectile.damageRadius !== undefined) {
            particles.grayPuff({
              center:projectile.center,
              dim:projectile.damageRadius
            });
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
    
    function isEntrance(i_in,j_in){
      for(var e=0; e<entrances.length; e++){
        for(var k=0; k<2; k++){
          var spot = entrances[e].in;
          if(k===1){ spot = entrances[e].out;}
          for(var i = spot.i; i<spot.i+spot.w;i++){
            if(i_in!==i){continue;}
            for(var j = spot.j; j<spot.j+spot.h;j++){
            if(j_in===j){return true;}
            }
          }
        }
      }
      return false;
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
          var fill = 'rgba(200,200,200,.1)';
          if(isEntrance(i,j)){fill = 'orange';}
          var rspec = {
                x:i*Constants.GridWidth,
                y:j*Constants.GridHeight,
                width:Constants.GridWidth,
                height:Constants.GridHeight,
                fill:fill,
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
      for(var i = 0; i<towers.length;i++){
        towers[i].renderProjectiles();
      }
      if (gameOver) {
        graphics.drawText({
        fill: 'black',
        stroke: 'black',
        font:'100px Arial',
        text:'Game Over',
        position: {x:50, y:235},
        hjustify:'left',
        vjustify:'top'
        })
      }
    }

    entrances.push({in:{i:0,j:12,w:1,h:5,a:0},out:{i:29, j:12,w:1,h:5},type:Constants.GroundType});
    entrances.push({in:{i:12,j:0,w:5,h:1,a:Math.PI/2},out:{i:12, j:29,w:5,h:1},type:Constants.GroundType});
    
    entrances.push({in:{i:0,j:12,w:1,h:5,a:0},out:{i:29, j:12,w:1,h:5},type:Constants.AirType});
    entrances.push({in:{i:12,j:0,w:5,h:1,a:Math.PI/2},out:{i:12, j:29,w:5,h:1},type:Constants.AirType});
    
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
      grids.push(updateShortestPaths(entrances[e]));
    }
    
    return that;
  }
  
  function ClickableComponent(spec) {
    var that = {
      get highlight() {return false;},
      get left() { return spec.center.x - Constants.TowerWidth / 2 },
      get right() { return spec.center.x + Constants.TowerWidth / 2 },
      get top() { return spec.center.y - Constants.TowerHeight / 2 },
      get bottom() { return spec.center.y + Constants.TowerHeight / 2 },
      get center() { return spec.center },
      set centerX(value) { spec.center.x = value },
      set centerY(value) { spec.center.y = value }
    },
    texture,
    currImg = 0;
    spec.opacity = 1;
    if (spec.images !== undefined) {
      spec.imageSrc = spec.images[currImg];
      spec.width = Constants.TowerWidth;
      spec.height = Constants.TowerHeight;
    }
    else {
      spec.width = graphics.measureTextWidth({
        text: spec.text,
        font: '20px Arial',
        fill: 'black'
      });
      spec.height = graphics.measureTextHeight({
        text: spec.text,
        font: '20px Arial',
        fill: 'black'
      });
      spec.width += 10;
      spec.height += 10;
      console.log(spec.width, spec.height);
    }
    
    texture = graphics.Texture(spec);
    
    that.handleClick = function() {
      spec.callback();
      if (spec.imageSrc !== undefined) {
        currImg++;
        if (currImg >= spec.images.length) {
          currImg = 0;
        }
        spec.imageSrc = spec.images[currImg];
        texture = graphics.Texture(spec);
      }
    }
    
    that.update = function() {}
    
    that.render = function() {
      if (spec.imageSrc !== undefined) {
        texture.draw();
        graphics.drawRectangle({
          stroke: 'black',
          x: spec.center.x - spec.width / 2,
          y: spec.center.y - spec.height / 2,
          width: spec.width,
          height: spec.height
        });
      } else {
        graphics.drawText({
          font: '20px Arial',
          fill: 'black',
          position: {
            x: spec.center.x - Constants.TowerWidth / 2 + 5,
            y: spec.center.y
          },
          text: spec.text,
          hjustify: 'left'
        });
        graphics.drawRectangle({
          stroke: 'black',
          x: spec.center.x - Constants.TowerWidth / 2,
          y: spec.center.y - spec.height / 2,
          width: spec.width,
          height: spec.height
        });
      }
    }
    
    return that;
  }
  
  function Tower_Projectile(){
    var spec = {
      imageSrcBase: 'images/towers/projectile-',
      audio: 'audio/projectile.wav',
      baseColor: 'rgba(79,6,39,1)',
      rotation: 3 * Math.PI / 2,
      center:{x:0,y:0},
      radius: 75,
      rotateSpeed: Math.PI,
      reloadTime: 0.75,
      projectileSpeed: 100,
      damage: [10, 20, 30],
      cost: [10, 15, 20],
      refund: [8, 15, 22],
      fill: 'black',
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
        damage: spec.damage[spec.level],
        fill: spec.fill,
        type: spec.type
      });
    }
    return that;
  }

  function Tower_Slowing(){
    var spec = {
      imageSrcBase: 'images/towers/slowing-',
      audio: 'audio/slowing.wav',
      baseColor: 'rgba(3,216,226,1)',
      rotation: 3 * Math.PI / 2,
      center:{x:0,y:0},
      radius: 50,
      rotateSpeed: Math.PI,
      reloadTime: 0.5,
      freezePower: 3,
      projectileSpeed: 75,
      damage: [5, 10, 15],
      cost: [8, 10, 12],
      refund: [5, 12, 20],
      fill: 'blue',
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
        damage: spec.damage[spec.level],
        fill: spec.fill,
        freezePower: spec.freezePower,
        type: spec.type
      });
    }
    return that;
  }
  
  function Tower_Bomb(){
    var spec = {
      imageSrcBase: 'images/towers/bomb-',
      audio: 'audio/bomb.wav',
      baseColor: 'rgba(255,84,0,1)',
      rotation: 3 * Math.PI / 2,
      center:{x:0,y:0},
      radius: 90,
      rotateSpeed: 2 * Math.PI / 3,
      reloadTime: 1.5,
      damageRadius: 60,
      fill: 'red',
      projectileSpeed: 60,
      damage: [23, 35, 40],
      cost: [15, 18, 22],
      refund: [11, 25, 38],
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
        damage: spec.damage[spec.level],
        fill: spec.fill,
        damageRadius: spec.damageRadius,
        type: spec.type
      });
    }
    
    return that;
  }
  
  function Tower_Missile(){
    var spec = {
      imageSrcBase: 'images/towers/missile-',
      audio: 'audio/missile.mp3',
      baseColor: 'rgba(27,248,26,1)',
      rotation: 3 * Math.PI / 2,
      center:{x:0,y:0},
      radius: 120,
      rotateSpeed: Math.PI,
      reloadTime: 1,
      fill: 'green',
      projectileSpeed: 85,
      damage: [20, 30, 35],
      cost: [13, 17, 20],
      refund: [9, 22, 37],
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
        damage: spec.damage[spec.level],
        fill: spec.fill,
        targetCreep: spec.targetCreep,
        type: spec.type
      });
    }
    
    return that;
  }
  
  function Creep_1(spec) {
    return Creep({
      spriteSheet: 'images/creep/creep-3-red/spriteSheet.png',
      rotation: 0,
      center: {x:0,y:0},
      rotateSpeed: Math.PI,
      width: Constants.CreepWidth,
      height: Constants.CreepHeight,
      lifePoints: 30,
      value:3,
      exitNumber: spec.exitNumber,
      speed: 40,
      spriteCount: 4,
      spriteTime: [ 1000, 200, 200, 200 ],
      type: Constants.GroundType
    });
  }
  
  function Creep_2(spec) {
    return Creep({
      spriteSheet: 'images/creep/creep-2-green/spriteSheet.png',
      rotation: 0,
      center: {x:0,y:0},
      rotateSpeed: Math.PI,
      width: Constants.CreepWidth,
      height: Constants.CreepHeight,
      lifePoints: 40,
      value:2,
      exitNumber: spec.exitNumber,
      speed: 50,
      spriteCount: 4,
      spriteTime: [ 200, 1000, 200, 600 ],
      type: Constants.GroundType
    });
  }
  
  function Creep_3(spec) {
    return Creep({
      spriteSheet: 'images/creep/creep-1-blue/spriteSheet.png',
      rotation: 0,
      center: {x:0,y:0},
      rotateSpeed: Math.PI,
      width: Constants.CreepWidth,
      height: Constants.CreepHeight,
      lifePoints: 35,
      value:1,
      exitNumber: spec.exitNumber,
      speed: 50,
      spriteCount: 6,
      spriteTime: [ 1000, 200, 100, 1000, 100, 200 ],
      type: Constants.AirType
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
    ToolBox : ToolBox,
    ClickableComponent : ClickableComponent
  };
}(DTD.graphics, DTD.particles, DTD.HighScores, DTD.audio));
