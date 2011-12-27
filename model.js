
// model.js - model layer entry point
(function() {

  // NOTE: A single client is re-used for the entire site
  // supposedly it pipelines the commands so we should be good
  var jam = require('jam')
    , redis = require('redis')
    , cfg = require('./config')
    , client = redis.createClient(cfg.redis.port, cfg.redis.host);

  // common redis extension to JAM
  var jx =
    { 'isOk': function(result) { this(result === '+OK'); }
    , 'asJson': function(result) { this(JSON.parse(result)); } };

  // wrap redis calls into meaningful(?) APIs
  var model =
    { 'verses':
      { 'find': function(id) {
          return jam.call(redis.get, 'v:' + id)(jx.asJson);
        }
      , 'save': function(verse) {
          var json = JSON.stringify(verse);
          return jam.call(redis.set, 'v:' + verse.id, json)(jx.isOk);
        }
      , 'nextId': function() {
          return jam.call(redis.incr, 'v:id');
        } }
    , 'users':
      { 'find': function(id) {
          return jam.call(redis.get, 'u:' + id)(jx.asJson);
        }
      , 'save': function(user) {
          var json = JSON.stringify(user);
          return jam.call(redis.set, 'u:' + user.id, json)(jx.isOk);
        }
      , 'nextId': function() {
          return jam.call(redis.inc, 'u:id');
        } } };

  module.exports = model;

})();
