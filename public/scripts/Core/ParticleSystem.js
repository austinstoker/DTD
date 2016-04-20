/*jslint browser: true, white: true */
/*global Random */

//------------------------------------------------------------------
//
// This is the particle system use by the game code
//
//------------------------------------------------------------------
DTD.particles =  (function(graphics) {
	'use strict';
	var that = {},
		nextName = 1,	// unique identifier for the next particle
		particles = {};	// Set of all active particles

	//------------------------------------------------------------------
	//
	// This creates one new box of particles
	//
	//------------------------------------------------------------------
	that.createCircleEffect = function(inVal) {
    var num = inVal.num;
    var rad = inVal.rad;
    var size = inVal.size;

		for(var i=0; i<num; i++){
        var pos = {x:Random.nextGaussian(inVal.center.x,rad/2),y:Random.nextGaussian(inVal.center.y,rad/2)};
				var dir = {x:Random.nextGaussian(0,2),y:Random.nextGaussian(0,2)};
				var p = SquareParticle({
						fill: inVal.color,
						stroke: inVal.color,
						width: size,
						height: size,
            gravity: 0,
						position: pos,
						direction: dir,
						speed: Random.nextGaussian(inVal.baseSpeed, inVal.baseSpeed/4), // pixels per second
						rotation: Random.nextGaussian(4, 1),
						lifetime: Random.nextGaussian(inVal.baseLife, inVal.baseLife/3),	// How long the particle should live, in seconds
						alive: 0	// How long the particle has been alive, in seconds
					});
				//
				// Assign a unique name to each particle
				particles[nextName++] = p;
			}
	};
  
  that.createRingEffect = function(inVal) {
    var num = inVal.num ||10;
    var rad = inVal.rad;
    var ringWidth = inVal.ringWidth;
    var size = inVal.size;

		for(var i=0; i<num; i++){
        var pos = {x:Random.nextGaussian(inVal.center.x,ringWidth/2),y:Random.nextGaussian(inVal.center.y,ringWidth/2)};
        var cir = Random.nextCircleVector()
        pos.x = pos.x+rad*cir.x;
        pos.y = pos.y+rad*cir.y;
				var dir = {x:Random.nextGaussian(0,2),y:Random.nextGaussian(0,2)};
				var p = SquareParticle({
						fill: inVal.color,
						stroke: inVal.color,
						width: size,
						height: size,
            gravity: 0,
						position: pos,
						direction: dir,
						speed: Random.nextGaussian(inVal.baseSpeed, inVal.baseSpeed/4), // pixels per second
						rotation: Random.nextGaussian(4, 1),
						lifetime: Random.nextGaussian(inVal.baseLife, inVal.baseLife/3),	// How long the particle should live, in seconds
						alive: 0	// How long the particle has been alive, in seconds
					});
				//
				// Assign a unique name to each particle
				particles[nextName++] = p;
			}
	};
  
  
  that.explosion = function(inVal) {
    
  }
  
  that.darkPuff = function(inVal) {
    that.createCircleEffect({
      center:inVal.center,
      num: 80,
      rad:5,
      size:.9,
      color:'black',
      baseSpeed:2,
      baseLife:.5,
    });
  }
  
  that.grayPuff = function(inVal) {
    that.createRingEffect({
      center:inVal.center,
      num: inVal.dim*inVal.dim/10,
      rad:inVal.dim,
      ringWidth:7,
      size:.5,
      color:'white',
      baseSpeed:1,
      baseLife:1,
    });
  }
  
  that.smokePuff = function(inVal) {
    that.createCircleEffect({
      center:inVal.center,
      num: 20,
      rad:0,
      size:.3,
      color:'white',
      baseSpeed:1,
      baseLife:.7,
    });
  }
  
  that.creepDeath = function(inVal) {
    that.createCircleEffect({
      center:inVal.center,
      num:200,
      rad:15,
      size:1,
      color:'green',
      baseSpeed: 4,
      baseLife: 1
    });
  }
  
  that.creepEscape = function(inVal) {
    that.createCircleEffect({
      center:inVal.center,
      num:200,
      rad:15,
      size:1,
      color:'red',
      baseSpeed: 4,
      baseLife: 1
    });
    var p = TextParticle({
        fill: 'red',
        stroke: 'white',
        font:"20px Arial",
        text:"-1",
        gravity: .3,
        position: inVal.center,
        direction: {x:0,y:-1},
        speed: Random.nextGaussian(20,3),
        rotation:0,
        lifetime: 1,	// How long the particle should live, in seconds
        alive: 0	// How long the particle has been alive, in seconds
      });
    //
    // Assign a unique name to each particle
    particles[nextName++] = p;
  }
  
  
  that.createFloatingNumberEffect = function(inVal){
    var p = TextParticle({
        fill: 'green',
        stroke: 'white',
        font:"20px Arial",
        text:inVal.text,
        gravity: .3,
        position: inVal.position,
        direction: {x:0,y:-1},
        speed: Random.nextGaussian(20,3),
        rotation:0,
        lifetime: 1,	// How long the particle should live, in seconds
        alive: 0	// How long the particle has been alive, in seconds
      });
    //
    // Assign a unique name to each particle
    particles[nextName++] = p;
  }
  
	
	//------------------------------------------------------------------
	//
	// Update the state of all particles.  This includes removing any that have exceeded their lifetime.
	//
	//------------------------------------------------------------------
	that.update = function(elapsedTime) {
		var removeMe = [],
			particle;
			
		//
		// We work with time in seconds, elapsedTime comes in as milliseconds
		elapsedTime = elapsedTime / 1000;
		
		Object.getOwnPropertyNames(particles).forEach(function(value, index, array) {
			particle = particles[value];
      particle.update(elapsedTime);
			// If the lifetime has expired, identify it for removal
			if (particle.isDead()) {
				removeMe.push(value);
			}
		});
    
		// Remove all of the expired particles
		for (particle = 0; particle < removeMe.length; particle++) {
			delete particles[removeMe[particle]];
		}
		removeMe.length = 0;
	};
	
  function SquareParticle(spec){
    var that = {};
    that.render = function(){
    graphics.drawRectangle({
        x:spec.position.x,
        y:spec.position.y,
        width:spec.width,
        height:spec.height,
        fill:spec.fill,
        stroke:spec.stroke
      });
    }
    that.update = function(elapsedTime){
    	// Update how long it has been alive
			spec.alive += elapsedTime;
			
			//
			// Update its position
			spec.position.x += (elapsedTime * spec.speed * spec.direction.x);
			spec.position.y += (elapsedTime * spec.speed * spec.direction.y)+spec.alive*spec.alive*spec.gravity;
			
			//
			// Rotate proportional to its speed
			spec.rotation += spec.speed / 500;
    }
    that.isDead = function(){
      return spec.alive > spec.lifetime;
    }
    
  return that;
  }
  
    function TextParticle(spec){
    var that = {};
    that.render = function(){
    graphics.drawText({
        position:spec.position,
        font:spec.font,
        text:spec.text,
        fill:spec.fill,
        stroke:spec.stroke
      });
    }
    that.update = function(elapsedTime){
    	// Update how long it has been alive
			spec.alive += elapsedTime;
			
			//
			// Update its position
			spec.position.x += (elapsedTime * spec.speed * spec.direction.x);
			spec.position.y += (elapsedTime * spec.speed * spec.direction.y)+spec.alive*spec.alive*spec.gravity;
			
			//
			// Rotate proportional to its speed
			spec.rotation += spec.speed / 500;
    }
    that.isDead = function(){
      return spec.alive > spec.lifetime;
    }
    
  return that;
  }
	//------------------------------------------------------------------
	//
	// Render all particles
	//
	//------------------------------------------------------------------
	that.render = function() {
		Object.getOwnPropertyNames(particles).forEach( function(value, index, array) {
			var particle = particles[value];
      particle.render();
			
		});
	};
	
	return that;
}(DTD.graphics))
