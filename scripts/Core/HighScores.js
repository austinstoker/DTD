// This file is based on sample code by Dean Mathias 
// these samples are used by permission and were distributed for 
// USU CS5410 Game Development Spring 2016
// Code modifications by Austin Stoker and Kendall Spackman

/* global Brickout */

// ------------------------------------------------------------------
//
// High scores implementation.  Behind the abstraction localStorage is
// used for client-side persistence.
//
// ------------------------------------------------------------------
DTD.HighScores = (function() {
	'use strict';
	var scores = [],
		previousScores = localStorage.getItem('DTD.highScores');

	if (previousScores !== null) {
		scores = JSON.parse(previousScores);
	}

	function add(score) {
		scores.push(score);
		scores.sort(function(a, b) {
			if (a > b) {
				return -1;
			} else if (a < b) {
				return 1;
			}

			return 0;
		});

		//
		// Keep only the best five
		if (scores.length > 5) {
			scores = scores.slice(0, 5);
		}

		localStorage['DTD.highScores'] = JSON.stringify(scores);
	}

	function get() {
		return scores;
	}

	return {
		add : add,
		get : get
	};
}());
