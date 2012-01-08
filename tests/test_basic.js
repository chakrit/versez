
// test_basic.js - Test the test framework itself for some basic function
module.exports = function(e, a) {
  e.test('Should pass.', function() { });
  e.test('Should fail.', function() { a.fail('Failure expected.'); });
};

