
// test_basic.js - Test the test framework itself for some basic function
module.exports = function(e, a) {

  e.test('Should pass.', function() { });

  e.log('env.testEval.scope should works if x === 1');
  e.testEval.scope = { x: 1 };
  e.testEval('x === 1');
  
};

