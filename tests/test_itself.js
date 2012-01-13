
// test_basic.js - Test the test framework itself for some basic function
module.exports = function(e, a) {

  e.testEval.scope =
    { 'x': 1
    , 'assert': a };

  e.test('Should pass.', function() { });
  
  e.testEval('x === 1', 'testEval and testEval.scope is working');
  e.test('assert.ok(true) is working.', function() { a.ok(true); });
  e.test('assert.ok(false) is working.', function() {
    try { a.ok(false); }
    catch (e) {
      a.ok(e instanceof Error);
      a.ok(e.name === 'AssertionError');
      return;
    }
    
    throw new Error('assert.ok(false) is not throwing any excetions.');
  });
  
};

