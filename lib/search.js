/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
(function(){
	"use strict";
	
	var scope;
	if ((typeof exports) !== "undefined"){
		scope = exports;
	}
	else {
		scope = require.register("./search", {});
	}
	
	const extension = require("./extension");
	const texts = [];
	
	scope.register = function(text, content){
		texts.push({text: text.toLowerCase(), content});
	};
	scope.search = function(search){
		const resultSets = search.toLowerCase().split(/\s+/).filter(function(term){
			return term.trim();
		}).map(function(term){
			return new RegExp(term);
		}).map(function(term){
			const matching = new Set();
			texts.forEach(function(text){
				if (term.test(text.text)){
					matching.add(text.content);
				}
			});
			return matching;
		});
		if (resultSets.length){
			return Array.from(
				resultSets.reduce(function(previousSet, set){
					var andSet = new Set();
					set.forEach(function(entry){
						if (previousSet.has(entry)){
							andSet.add(entry);
						}
					});
					return andSet;
				})
			);
		}
		else {
			return [];
		}
	};
	const searchListeners = [];
	scope.init = function(){
		const node = document.createElement("input");
		node.id = "search";
		node.placeholder = extension.getTranslation("search");
		window.setTimeout(() => node.focus(), 1);
		let lastResults = [];
		node.addEventListener("input", function(){
			this.search();
		});
		node.search = function(){
			const search = this.value;
			const results = search? scope.search(search): [];
			searchListeners.forEach(function(callback){
				callback({search, results, lastResults});
			});
			lastResults = results;
		};
		return node;
	};
	scope.on = function(callback){
		searchListeners.push(callback);
	};
}());