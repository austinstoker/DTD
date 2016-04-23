// This file is based on sample code by Dean Mathias 
// these samples are used by permission and were distributed for 
// USU CS5410 Game Development Spring 2016
// Code modifications by Austin Stoker and Kendall Spackman

/* global DTD */

// ------------------------------------------------------------------
//
// High scores implementation. Queries the server for storage.
//
// ------------------------------------------------------------------
DTD.HighScores = (function() {
	'use strict';

	function add(scores) {
		$.ajax({
			url: 'http://localhost:3000/v1/scores?creeps=' + scores.creepsKilled + '&towersval=' + scores.totalTowerValue,
			type: 'POST',
			error: function() { alert('POST failed'); },
			success: function() {
				//get(); // And display...
			}
		});
	}

	function get(callback) {
		$.ajax({
			url: 'http://localhost:3000/v1/scores',
			cache: false,
			type: 'GET',
			error: function() { alert('GET failed'); },
			success: function(data) {
				callback(data);
			}
		});
	}

	return {
		add : add,
		get : get
	};
}());
