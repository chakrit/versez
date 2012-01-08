
// model_basic.js - Basic model tests
var m = require('../model');

module.exports = function(e, a) {

  e.test("m.create('User') instanceof m.User", function() {
    a.ok(m.create('User') instanceof m.User);
  });

  e.test("m.create('Verse') instanceof m.Verse", function() {
    a.ok(m.create('Verse') instanceof m.Verse);
  });

  e.test("Failure test.", function() {
    a.ok(false);
  });

};
