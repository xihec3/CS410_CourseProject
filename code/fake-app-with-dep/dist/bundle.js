(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

window.getAutoCorrected = function getAutoCorrected(word) {
  var autocorrect = require('autocorrect')();

  return autocorrect(word);
};

},{"autocorrect":2}],2:[function(require,module,exports){
var fs = require('fs')
var leven = require('leven')
var wordListPath = require('word-list')

var readDictionary = function(path) {
  path || (path = wordListPath)
  return fs.readFileSync(path).toString().trim().split('\n')
}

var autocorrect = function(options) {
  options || (options = {})
  var dictionary = options.words || readDictionary(options.dictionary)
  var len = dictionary.length

  return function(str) {
    var distance, bestWord, i, word, min

    for (i = 0; i < len; i++) {
      word = dictionary[i]
      distance = leven(str, word)

      if (distance === 0) {
        return word
      } else if (min === undefined || distance < min) {
        min = distance
        bestWord = word
      }
    }

    return bestWord
  }
}

module.exports = autocorrect

},{"fs":3,"leven":4,"word-list":5}],3:[function(require,module,exports){

},{}],4:[function(require,module,exports){
/* eslint-disable no-nested-ternary */
'use strict';
var arr = [];
var charCodeCache = [];

module.exports = function (a, b) {
	if (a === b) {
		return 0;
	}

	var swap = a;

	// Swapping the strings if `a` is longer than `b` so we know which one is the
	// shortest & which one is the longest
	if (a.length > b.length) {
		a = b;
		b = swap;
	}

	var aLen = a.length;
	var bLen = b.length;

	if (aLen === 0) {
		return bLen;
	}

	if (bLen === 0) {
		return aLen;
	}

	// Performing suffix trimming:
	// We can linearly drop suffix common to both strings since they
	// don't increase distance at all
	// Note: `~-` is the bitwise way to perform a `- 1` operation
	while (aLen > 0 && (a.charCodeAt(~-aLen) === b.charCodeAt(~-bLen))) {
		aLen--;
		bLen--;
	}

	if (aLen === 0) {
		return bLen;
	}

	// Performing prefix trimming
	// We can linearly drop prefix common to both strings since they
	// don't increase distance at all
	var start = 0;

	while (start < aLen && (a.charCodeAt(start) === b.charCodeAt(start))) {
		start++;
	}

	aLen -= start;
	bLen -= start;

	if (aLen === 0) {
		return bLen;
	}

	var bCharCode;
	var ret;
	var tmp;
	var tmp2;
	var i = 0;
	var j = 0;

	while (i < aLen) {
		charCodeCache[start + i] = a.charCodeAt(start + i);
		arr[i] = ++i;
	}

	while (j < bLen) {
		bCharCode = b.charCodeAt(start + j);
		tmp = j++;
		ret = j;

		for (i = 0; i < aLen; i++) {
			tmp2 = bCharCode === charCodeCache[start + i] ? tmp : tmp + 1;
			tmp = arr[i];
			ret = arr[i] = tmp > ret ? tmp2 > ret ? ret + 1 : tmp2 : tmp2 > tmp ? tmp + 1 : tmp2;
		}
	}

	return ret;
};

},{}],5:[function(require,module,exports){
(function (__dirname){(function (){
'use strict';
module.exports = __dirname + '/words.txt';

}).call(this)}).call(this,"/node_modules/word-list")
},{}]},{},[1]);
