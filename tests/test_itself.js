
// test_basic.js - Test the test framework itself for some basic function

var assert = require('assert')
  , log = require('../log');

module.exports = function(e, a) {
  
  // UNCOMMENT TO RUN
  return;

  // check module precondition
  assert(e, 'Test environment variable not supplied to test module.');
  assert(a, 'Test asserter supplied to test module.');

  
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

  // _______________________________________________________
  e.log('async');

  e.testAsync('testAsync should works', function(callback) {
    process.nextTick(callback);
  });
  e.testAsync('Timeout expected!', function(callback) {
    setTimeout(callback, 3000);
  });
  
};

// module.exports.ignored = true;
