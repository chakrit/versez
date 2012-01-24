
// model.js - Versez model layer entry point
(function(undefined) {

  var _ = require('underscore')
    , config = require('./config');

  var m = { }
    , ID_NEW = -1
    , NS = 'v:';

  // initialize redis client
  var r = require('redis').createClient(config.redis.port, config.redis.host);
  r.select(config.redis.db);

  // model utils
  var isPrivate = function(name) { return !!name.match(/^_.*$/); };

  var safeExtend = function(dest, src) {
    for (var key in src) (function(key, value) {
      if (isPrivate(key)) return;
      if (value instanceof Function) return;

      dest[key] = value;
    })(key, src[key]);

    return dest;
  };

  // base model definition template
  var defineModel = function(name, defaults) {
    var Model = function() { };
    Model.prototype =
      { '_id': ID_NEW
      , '_type': name
      , 'toSafe': function() { return safeExtend({ }, this); }
      , 'toJson': function() { return JSON.stringify(this.toSafe()); } };
    
    Model.load = function(id, callback) {
      redis.get(NS + this._type + ':' + id, function(e, json) {
        callback(null, _.extend(new Model(), JSON.parse(json)));
      });
    };

    Model.prototype.save = function(callback) {
      var me = this;

      if (this._id === ID_NEW) {
        redis.set(NS + this._type + ':id', function(e, newId) {
          me._id = newId;
          me.save(callback);
        });

      } else {
        redis.set(NS + this._type + ':' + this._id, callback);
      }
    };

    return Model;
  }


  // model definitions
  m.User = defineModel('User',
    { 'username': null
    , 'passwordHash': null
    , 'joinDate': null
    , 'lastLoginDate': null
    , 'twitterId': null });

  m.Verse = defineModel('Verse',
    { 'text': null
    , 'createDate': null
    , 'authorId': -1
    , 'likes': 0
    , 'parentId': -1 });

  // repository functions
  var h = // model helpers
    { 'isOk': function(result) { this(result); }
    , 'asObj': function(json) { this(JSON.parse(json)); }
    , 'asJson': function(obj) { this(JSON.stringify(obj)); } };

  // model layer functions
  m.switchToTestDb = function() {
    return jam(function() { r.select(config.redis.testDb, this); });
  };

  m.create = function(type, values) { 
    return safeExtend(new m[type](), values);
  };
  
  // export the `m` object
  module.exports = m;

})();
