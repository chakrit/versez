
// model.relations.js - Test model relationships
module.exports = function(e, a) {
  
  var m = require('../model.js');
  e.testEval.scope = { 'm': m };

  e.testEval("'getVerses' in (new m.User)");
  e.testEval("'getAuthor' in (new m.Verse)");

};
