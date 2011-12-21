
// model.js - model layer entry point
(function() {

  var jam = require('jam')
    , redis = require('redis')
    , client = redis.createClient();

  // will explain later :)
  var model =
    { 'verses':
      { 'find': function(id) {
          return jam(function() { redis.get('v:' + id, this); })
            .map(JSON.parse);
        }
      , 'save': function(verse) {
          return jam.return(JSON.stringify(verse))
            (function(json) { redis.set('v:' + id, json, this); })
            (function(reuslt) { this(result === '+OK'); });
        } } };

  // post-processing
  for (var key in model) {
    var modelClass = model[key];
    // apply any layer-wide stuff
  }

  module.exports = model;

})();
