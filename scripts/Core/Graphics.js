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
		context.fillStyle = spec.fill;
    context.globalAlpha = spec.opacity||1;
		context.fillRect(spec.x, spec.y, spec.width, spec.height);

		context.strokeStyle = spec.stroke;
		context.strokeRect(spec.x, spec.y, spec.width, spec.height);
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

	return {
		clear : clear,
		drawRectangle : drawRectangle,
		drawText: drawText,
    drawImage : drawImage,
    drawCircle : drawCircle,
		measureTextWidth: measureTextWidth,
		measureTextHeight: measureTextHeight,
    relMouse : relMouse
	};
}());
