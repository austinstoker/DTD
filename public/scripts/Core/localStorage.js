// This file is based on sample code by Dean Mathias 
// these samples are used by permission and were distributed for 
// USU CS5410 Game Development Spring 2016
// Code modifications by Austin Stoker and Kendall Spackman

/* global DTD */

// ------------------------------------------------------------------
//
// High scores implementation.  Behind the abstraction localStorage is
// used for client-side persistence.
//
// ------------------------------------------------------------------
DTD.localStorage = (function() {
	'use strict';
	var items = {},
		prevItems = localStorage.getItem('DTD.local');

	if (prevItems !== null) {
		items = JSON.parse(prevItems);
	}

	function set(key,val) {
		items[key] = val;

		localStorage['DTD.local'] = JSON.stringify(items);
	}

	function get() {
		return items;
	}

	return {
		set : set,
		get : get
	};
}());