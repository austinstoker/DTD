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
    var num = inVal.num ||10;
    var rad = inVal.rad;
    var size = inVal.size;

		for(var i=0; i<num; i++){
        var pos = {x:Random.nextGaussian(inVal.center.x,rad/2),y:Random.nextGaussian(inVal.center.y,rad/2)};
				var dir = {x:Random.nextGaussian(0,2),y:Random.nextGaussian(0,2)};
				var p = {
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
					};
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
				var p = {
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
					};
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
  
  that.createFloatingNumberEffect = function(inVal){
      
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
			//
			// Update how long it has been alive
			particle.alive += elapsedTime;
			
			//
			// Update its position
			particle.position.x += (elapsedTime * particle.speed * particle.direction.x);
			particle.position.y += (elapsedTime * particle.speed * particle.direction.y)+particle.alive*particle.alive*particle.gravity;
			
			//
			// Rotate proportional to its speed
			particle.rotation += particle.speed / 500;
			
			//
			// If the lifetime has expired, identify it for removal
			if (particle.alive > particle.lifetime) {
				removeMe.push(value);
			}
		});
		
		//
		// Remove all of the expired particles
		for (particle = 0; particle < removeMe.length; particle++) {
			delete particles[removeMe[particle]];
		}
		removeMe.length = 0;
	};
	
	//------------------------------------------------------------------
	//
	// Render all particles
	//
	//------------------------------------------------------------------
	that.render = function() {
		Object.getOwnPropertyNames(particles).forEach( function(value, index, array) {
			var particle = particles[value];
			graphics.drawRectangle({
        x:particle.position.x,
        y:particle.position.y,
        width:particle.width,
        height:particle.height,
        fill:particle.fill,
        stroke:particle.stroke
      });
		});
	};
	
	return that;
}(DTD.graphics))
