
// sample.js - Sample test file (for study only)
module.exports = function(e, a) {

  e.test('Should pass.', function() { });
  e.test('Should fail.', function() { e.fail('no reason.'); });

  e.log('log messages');

  e.test('Should pass using assert', function() {
      a.ok(true);
  });
  e.test('Should fail with assertion error', function() {
      a.ok(false);
  });

};

// REMOVE THIS LINE TO ENABLE:
module.exports.ignored = true;
