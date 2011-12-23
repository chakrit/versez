
// model.js - model layer entry point
(function() {

  var jam = require('jam')
    , redis = require('redis')
    , client = redis.createClient();

  // common redis extension to JAM
  // TODO: Actually could make use of prototypes in JAM so we
  //   can manipulate functions and add extensions/whatnot here
  //   just like jQuery.fn === jQuery.prototype
  var jx =
    { 'isOk': function(result) { this(result === '+OK'); }
    , 'asJson': function(result) { this(JSON.parse(result)); } };

  // will explain later :)
  var model =
    { 'verses':
      { 'find': function(id) {
          return jam.call(redis.get, 'v:' + id)(jx.asJson);
        }
      , 'save': function(verse) {
          var json = JSON.stringify(verse);
          return jam.call(redis.set, 'v:' + verse.id, json)(jx.isOk);
        } }
    , 'users':
      { 'find': function(id) {
          return jam.call(redis.get, 'u:' + id)(jx.asJson);
        }
      , 'save': function(user) {
          var json = JSON.stringify(user);
          return jam.call(redis.set, 'u:' + user.id, json)(jx.isOk);
        } } };

  module.exports = model;

})();
