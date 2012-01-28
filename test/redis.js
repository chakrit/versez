
// redis.js - Test redis connectivity
require('../platform/test')(module)(function(v, a, config) {

  var _ = require('underscore');
  
  // only worries about redis stuff
  config = config.redis;

  // redis helpers
  var redis = function() { return require('redis'); }
    , connect = function() { return redis().createClient(config.port, config.host); };

  var cmd = function() {
    var args = _.toArray(arguments)
      , cmdName = args.shift()
      , client = connect();

    return client[cmdName].apply(client, args);
  };

  // specs
  v.describe('Redis').addBatch(

    { 'with configured host/port':
      { topic: function() { return connect(); }
      , 'should connects properly': function(result) { a.isNotNull(result); } }

    , 'when sent PINGs':
      { topic: function() { cmd('ping', this.callback); }
      , 'should responds with PONG': function(e, result) { a.equal(result, 'PONG'); } } });

});
