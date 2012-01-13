
// test_basic.js - Test the test framework itself for some basic function
module.exports = function(e, a) {

  e.testEval.scope =
    { 'x': 1
    , 'assert': a };

  e.test('Should pass.', function() { });
  e.testEval('x === 1', 'testEval and testEval.scope is working.');

  // _______________________________________________________
  e.log('assert');

  e.test('assert.error with exception', function() {
    a.error('AssertionError', function() { a.ok(false); });
  });

  e.test('assert.error without exception', function() {
    try { a.error('AssertionError', function() { a.ok(true); }); }
    catch (e) { return; /* correct */ }

    throw new Error('assert.error not working.');
  });
  
  e.test('assert(true)', function() { a(true); });
  e.test('assert(false)', function() {
    a.error('AssertionError', function() { a(false); });
  });

  e.test('assert.ok(true)', function() { a.ok(true); });
  e.test('assert.ok(false)', function() {
    a.error('AssertionError', function() { a.ok(false); });
  });

  e.test('assert.not(false)', function() { a.not(false); });
  e.test('assert.not(true)', function() {
    a.error('AssertionError', function() { a.not(true); });
  });

  
};

module.exports.ignored = true;
