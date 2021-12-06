window.getAutoCorrected = function getAutoCorrected(word) {
  var autocorrect = require('autocorrect')();
  return autocorrect(word);
}

