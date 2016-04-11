// This file is based on sample code by Dean Mathias 
// these samples are used by permission and were distributed for 
// USU CS5410 Game Development Spring 2016
// Code modifications by Austin Stoker and Kendall Spackman

/*global CanvasRenderingContext2D, Core */

// ------------------------------------------------------------------
//
// This provides the rendering code for the game.
//
// ------------------------------------------------------------------
DTD.graphics = (function() {

	var canvas = document.getElementById('canvas-main'),
		context = canvas.getContext('2d');

	//
	// Place a 'clear' function on the Canvas prototype, this makes it a part
	// of the canvas, rather than making a function that calls and does it.
	CanvasRenderingContext2D.prototype.clear = function() {
		this.save();
		this.setTransform(1, 0, 0, 1, 0, 0);
		this.clearRect(0, 0, canvas.width, canvas.height);
		this.restore();
	};

//Got this at http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
  function relMouse(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = canvas;

    do{
        totalOffsetX += currentElement.offsetLeft ;//+ currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop ;//+ currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
  }
	//------------------------------------------------------------------
	//
	// Public method that allows the client code to clear the canvas.
	//
	//------------------------------------------------------------------
	function clear() {
		context.clear();
	}

	//------------------------------------------------------------------
	//
	// Expose an ability to draw an image/texture on the canvas.
	//
	//------------------------------------------------------------------
	function drawImage(image, spec) {
        //console.log("Rotation: " + spec.rotation);
		context.save();
		
		context.translate(spec.center.x, spec.center.y);
		context.rotate(spec.rotation);
		context.translate(-spec.center.x, -spec.center.y);
		
        context.globalAlpha = spec.opacity;
		context.drawImage(
			image,
			spec.center.x - spec.width/2, 
			spec.center.y - spec.height/2,
			spec.width, spec.height);
		
		context.restore();
	}
  
	//------------------------------------------------------------------
	//
	// Draws a rectangle
	//
	//------------------------------------------------------------------
	function drawRectangle(spec) {
    context.globalAlpha = spec.opacity||1;
    if ('fill' in spec) {
      context.fillStyle = spec.fill;
      context.fillRect(spec.x, spec.y, spec.width, spec.height);
    }
    
    if ('stroke' in spec) {
      context.strokeStyle = spec.stroke;
      context.strokeRect(spec.x, spec.y, spec.width, spec.height);
    }
    context.globalAlpha = 1;
	}

	//------------------------------------------------------------------
	//
	// Returns the width of the specified text, in pixels.
	//
	//------------------------------------------------------------------
	function measureTextWidth(spec) {
		context.save();

		context.font = spec.font;
		context.fillStyle = spec.fill;
		if (spec.hasOwnProperty('stroke')) {
			context.strokeStyle = spec.stroke;
		}
		var width = context.measureText(spec.text).width;

		context.restore();

		return width;
	}

	//------------------------------------------------------------------
	//
	// Returns the height of the specified text, in pixels.
	//
	//------------------------------------------------------------------
	function measureTextHeight(spec) {
		var saveText = spec.text;

		spec.text = 'm';	// Clever trick to get font height
		context.save();

		context.font = spec.font;
		context.fillStyle = spec.fill;
		if (spec.hasOwnProperty('stroke')) {
			context.strokeStyle = spec.stroke;
		}
		var width = context.measureText(spec.text).width;
		spec.text = saveText;

		context.restore();

		return width;
	}

	//------------------------------------------------------------------
	//
	// Draws a circle
	//
	//------------------------------------------------------------------
	function drawCircle(spec) {
        if ('center' in spec) {
            spec.x = spec.center.x;
            spec.y = spec.center.y;
        }
        context.beginPath();
        context.arc(spec.x, spec.y, spec.radius, 0, 2 * Math.PI);
        
        if ('fill' in spec) {
            context.fillStyle = spec.fill;
            context.fill();
        }
        
        if ('stroke' in spec) {
            context.strokeStyle = spec.stroke;
            context.stroke();
        }
        
	}
  
	//------------------------------------------------------------------
	//
	// Draw some text to the screen
	//
	//------------------------------------------------------------------
	function drawText(spec) {
		context.save();

		context.font = spec.font,
		context.fillStyle = spec.fill;
		if (spec.hasOwnProperty('stroke')) {
			context.strokeStyle = spec.stroke;
		}
		context.textBaseline = 'top';

		context.fillText(spec.text, spec.position.x, spec.position.y);
		context.strokeText(spec.text, spec.position.x, spec.position.y);

		context.restore();
	}

	//------------------------------------------------------------------
	//
	// Provides rendering support for a sprite animated from a sprite sheet.
	//
	//------------------------------------------------------------------
	function SpriteSheet(spec) {
		var that = {},
			image = new Image();
		//
		// Initialize the animation of the spritesheet
		spec.sprite = 0;		// Which sprite to start with
		spec.elapsedTime = 0;	// How much time has occured in the animation
		
		//
		// Load the image, set the ready flag once it is loaded so that
		// rendering can begin.
		image.onload = function() { 
			//
			// Our clever trick, replace the draw function once the image is loaded...no if statements!
			that.draw = function() {
				context.save();
				
				context.translate(spec.center.x, spec.center.y);
				context.rotate(spec.rotation);
				context.translate(-spec.center.x, -spec.center.y);
				
				//
				// Pick the selected sprite from the sprite sheet to render
				context.drawImage(
					image,
					spec.imgWidth * spec.sprite, 0,	// Which sprite to pick out
					spec.imgWidth, spec.imgHeight,		// The size of the sprite
					spec.center.x - spec.width/2,	// Where to draw the sprite
					spec.center.y - spec.height/2,
					spec.width, spec.height);
				
				context.restore();
			};
			//
			// Once the image is loaded, we can compute the height and width based upon
			// what we know of the image and the number of sprites in the sheet.
			spec.imgHeight = image.height;
			spec.imgWidth = image.width / spec.spriteCount;
		};
		image.src = spec.spriteSheet;
		
		//------------------------------------------------------------------
		//
		// Update the animation of the sprite based upon elapsed time.
		//
		//------------------------------------------------------------------
		that.update = function(elapsedTime, forward) {
			spec.elapsedTime += elapsedTime;
			//
			// Check to see if we should update the animation frame
			if (spec.elapsedTime >= spec.spriteTime[spec.sprite]) {
				//
				// When switching sprites, keep the leftover time because
				// it needs to be accounted for the next sprite animation frame.
				spec.elapsedTime -= spec.spriteTime[spec.sprite];
				//
				// Depending upon the direction of the animation...
				if (forward === true) {
					spec.sprite += 1;
					//
					// This provides wrap around from the last back to the first sprite
					spec.sprite = spec.sprite % spec.spriteCount;
				} else {
					spec.sprite -= 1;
					//
					// This provides wrap around from the first to the last sprite
					if (spec.sprite < 0) {
						spec.sprite = spec.spriteCount - 1;
					}
				}
			}
		};
		
		//------------------------------------------------------------------
		//
		// Render the correct sprint from the sprite sheet
		//
		//------------------------------------------------------------------
		that.draw = function() {
			//
			// Starts out empty, but gets replaced once the image is loaded!
		};
			
		return that;
	}

	return {
		clear : clear,
		drawRectangle : drawRectangle,
		drawText: drawText,
    drawImage : drawImage,
    drawCircle : drawCircle,
		measureTextWidth: measureTextWidth,
		measureTextHeight: measureTextHeight,
    relMouse : relMouse,
    SpriteSheet : SpriteSheet
	};
}());
