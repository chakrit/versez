
// redis.js - Test redis connectivity
require('../platform/test')(module)(function(v, a, config) {

  var _ = require('underscore');
  
  // redis helpers
  var connect = function() { return require('redis-url').connect(config.redis.url); };

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
