
// model.js - model layer entry point
(function() {

  var jam = require('jam')
    , redis = require('redis')
    , client = redis.createClient();

  // TODO: Add jam.map() and jam.return()
  var model =
    { 'verses':
      { 'find': function(id) {
          return jam(function() { redis.get('v:' + id, this); })
            (function(json) { this(JSON.parse(raw)); });
        }
      , 'save': function(verse) {
          return jam(function() { this(JSON.stringify(verse)); })
            (function(json) { redis.set('v:' + id, json, this); })
            (function(result) { this(result == "+OK"); });
        } } };

  // post-processing
  for (var key in model) {
    var modelClass = model[key];
    // apply any layer-wide stuff
  }

  module.exports = model;

})();
