
// model_basic.js - Basic model tests
module.exports = function(e, a) {

  e.testEval.scope = { m: require('../model') };

  e.testEval("m.create('User') instanceof m.User");
  e.testEval("m.create('Verse') instanceof m.Verse");

};
