
// sanity.js - Sanity check test.
require('../platform/test')(module)(function(v, a, config) {

  v.describe('Sane test platform').addBatch(
    { 'calculating 1 + 1':
      { topic: function() { return 1 + 1; }
      , 'should eqauls 2': function(result) { a.equal(result, 2); } } });

});
