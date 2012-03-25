
// controller.js - Test controller functions
require('../platform/test')(module, function(v, a, config) {

  var _ = require('underscore')
    , ctr = require('../server/controller.js');

/* Home.index Users.show Users.verses
 * Verses.show Verses.children
 */

  with (require('../platform/controller')) { // inject platform stuff into scope

    // shared tests macro
    var describeCtr = function(name, extras) {
      var batch =
        { 'shared instance':
          { topic: ctr[name]
          , 'should be instanceof Controller': function(c) { a.instanceOf(c, Controller); } }

        // for action tests, use the bare controller (no expressjs stuff added)
        , 'bare instance': _.extend( { topic: ctr[name].bare }, extras) };

      return v.describe(name + ' controller').addBatch(batch);
    }

    // controller-specific tests
    describeCtr('Home',
      { 'when .index is called':
        { topic: function(c) { return c.index(); }
        , 'a View should be returned': function(r) { a(r._isView); } } });

    // TODO: Add tests for these things (and might as well implement .create too
    describeCtr('Users', { });
    describeCtr('Verses', { });

  }

});
