window.getAutoCorrected = function getAutoCorrected(word) {
  var autocorrect = require('autocorrect')();
  return autocorrect(word);
}

window.getSynonyms = function getSynonyms(word) {
  var synonyms = require("synonyms");

  var synonym_list = synonyms(word);
  if (synonym_list == null) {
    return [];
  }
  var all_synonyms = new Array();
  if (synonym_list.n != null) {
    all_synonyms = all_synonyms.concat(synonym_list.n);
  }
  if (synonym_list.v != null) {
    all_synonyms = all_synonyms.concat(synonym_list.v);
  }

  return all_synonyms;
}

window.getStemming = function getStemming(word) {
  var stemmer = require('porter-stemmer-english');
  return stemmer(word);
}
