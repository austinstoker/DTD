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
	that.createBoxEffect = function(inVal) {
    var xdiv = inVal.div ||10;
    var ydiv = inVal.div ||10;
    var dim = inVal.dim;
		var dx = dim/xdiv,
		  dy = dim/ydiv,
		  xpos = inVal.center.x-dim/2,
		  ypos = inVal.center.y-dim/2,
		  dir = {x: xpos - inVal.center.x, y: ypos-inVal.center.y}

		for(var i=0; i<xdiv; i++){
			xpos += dx;
			ypos = inVal.center.y-dim/2;
			for(var j=0; j<ydiv; j++){
				ypos += dy;
				dir = {x: (xpos - inVal.center.x), y: (ypos-inVal.center.y)};
				var p = {
						fill: inVal.color,
						stroke: inVal.color,
						width: dx,
						height: dx,
            gravity: 0,
						position: {x: xpos, y: ypos},
						direction: {x:Random.nextGaussian(0, 3),y:Random.nextGaussian(0, 3)},
						speed: Random.nextGaussian(inVal.baseSpeed, inVal.baseSpeed/4), // pixels per second
						rotation: Random.nextGaussian(4, 1),
						lifetime: Random.nextGaussian(1, 1),	// How long the particle should live, in seconds
						alive: 0	// How long the particle has been alive, in seconds
					};
				//
				// Assign a unique name to each particle
				particles[nextName++] = p;
			}
		}
	};
  
  that.explosion = function(inVal) {
    
  }
  
  that.smokePuff = function(inVal) {
    that.createBoxEffect({
      center:inVal.center,
      div: 5,
      dim:.1,
      color:'white',
      baseSpeed:1,
    });
  }
  
  that.creepDeath = function(inVal) {
    that.createBoxEffect({
      center:inVal.center,
      dim:40,
      color:'green',
      baseSpeed: 4,
    });
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
