
// test.js - Vows-augmented test layer
//
// USAGE: Use this syntax in your test file to properly export/run the test
// 
//   require('../platform/test')(module)(function(v, a, config) {
//
//     // v == require('vows') and
//     // a == require('assert') // with versez's augmented asserts as well
//
//   });
//
module.exports = (function(undefined) {
  return function(testModule) {
    return function(moduleCallback) {
      
      var _ = require('underscore')
        , vows = require('vows')
        , assert = require('assert')
        , config = require('../config')
        , descriptions = { };

      // steal vows's describe to record them for later post processing
      vows.describe = _.wrap(_.bind(vows.describe, vows), function(oldDescribe, title) {
	return descriptions[title] = oldDescribe(title);
      });

      // run the test descriptors
      moduleCallback(vows, assert, config);

      // automatically export all vows describes
      for (var title in descriptions) {
	descriptions[title].export(testModule);
      }

    };
  };
})();
