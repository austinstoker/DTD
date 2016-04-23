// This file is based on sample code by Dean Mathias 
// these samples are used by permission and were distributed for 
// USU CS5410 Game Development Spring 2016
// Code modifications by Austin Stoker and Kendall Spackman

/*jslint browser: true, white: true */
/*global window, Modernizr, Image, yepnope */
//------------------------------------------------------------------
//
// Wait until the browser 'onload' is called before starting to load
// any external resources.  This is needed because a lot of JS code
// will want to refer to the HTML document.
//
//------------------------------------------------------------------
window.addEventListener('load', function() {
	console.log('Loading resources...');
	Modernizr.load([
		{
			load : [
        'preload!images/towers/bomb-0.png',
        'preload!images/towers/bomb-1.png',
        'preload!images/towers/bomb-2.png',
        'preload!images/towers/missile-0.png',
        'preload!images/towers/missile-1.png',
        'preload!images/towers/missile-2.png',
        'preload!images/towers/projectile-0.png',
        'preload!images/towers/projectile-1.png',
        'preload!images/towers/projectile-2.png',
        'preload!images/towers/slowing-0.png',
        'preload!images/towers/slowing-1.png',
        'preload!images/towers/slowing-2.png',
        'preload!images/creep/creep-1-blue/spriteSheet.png',
        'preload!images/creep/creep-2-green/spriteSheet.png',
        'preload!images/creep/creep-3-red/spriteSheet.png',
				'preload!images/sounds.png',
				'preload!images/sounds_mute.png',
				'preload!images/music.png',
				'preload!images/music_mute.png',
        'preload!scripts/Core/Graphics.js',
        'preload!scripts/Core/input.js',
        'preload!scripts/Core/localStorage.js',
				'preload!scripts/Core/Audio.js',
        'preload!scripts/Core/HighScores.js',
        'preload!scripts/Core/random.js',
        'preload!scripts/Core/ParticleSystem.js',
        'preload!scripts/Core/screens.js',
				'preload!scripts/Gameplay/Components.js',
        'preload!scripts/Gameplay/GameModel.js',
        'preload!scripts/Gameplay/page-mainmenu.js',
        'preload!scripts/Gameplay/page-game.js',
        'preload!scripts/Gameplay/page-config.js',
        'preload!scripts/Gameplay/page-highscores.js',
        'preload!scripts/Gameplay/page-about.js',
				'preload!audio/bomb.wav',
				'preload!audio/death.wav',
				'preload!audio/missile.mp3',
				'preload!audio/music.mp3',
				'preload!audio/projectile.wav',
				'preload!audio/sell.wav',
				'preload!audio/slowing.wav'
				
			],
			complete : function() {
				console.log('All files requested for loading...');
			}
		}
	]);
}, false);

//
// Extend yepnope with our own 'preload' prefix that...
// * Tracks how many have been requested to load
// * Tracks how many have been loaded
// * Places images into the 'images' object
yepnope.addPrefix('preload', function(resource) {
	// console.log('preloading: ' + resource.url);

	DTD.status.preloadRequest += 1;
	var isImage = /.+\.(jpg|png|gif)$/i.test(resource.url);
	var isSound = /.+\.(mp3|wav)$/i.test(resource.url);
	resource.noexec = isImage || isSound;
	resource.autoCallback = function(e) {
		if (isImage) {
			var image = new Image();
			image.src = resource.url;
			DTD.images[resource.url] = image;
		}
		else if (isSound) {
			var sound = new Audio(resource.url);
			DTD.sounds[resource.url] = sound;
		}
		DTD.status.preloadComplete += 1;

		//
		// When everything has finished preloading, go ahead and start the game
		if (DTD.status.preloadComplete === DTD.status.preloadRequest) {
			console.log('Preloading complete!');
			DTD.screens.initialize();
		}
	};

	return resource;
});

//
// Extend yepnope with a 'preload-noexec' prefix that loads a script, but does not execute it.  This
// is expected to only be used for loading .js files.
yepnope.addPrefix('preload-noexec', function(resource) {
	console.log('preloading-noexec: ' + resource.url);
	resource.noexec = true;
	return resource;
});
