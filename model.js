
// model.js - Versez model layer entry point
(function(undefined) {

  var redis = require('redis')
    , jam = require('jam')
    , _ = require('underscore')
    , cfg = require('./config')
    , redisClient = redis.createClient(cfg.redis.port, cfg.redis.host);

  var m = { }
    , ID_NEW = -1;

  // model utils
  var isPrivate = function(name) { return !!name.match(/^_.*$/); };

  var safeExtend = function(dest, src) {
    for (var key in src) (function(key, value) {
      if (isPrivate(key)) return;
      if (value instanceof Function) return;

      dest[key] = value;
    })(key, src[key]);

    return dest;
  }

  // base model definition template
  m.ModelBase = function() { };
  m.ModelBase.prototype =
    { '_id': ID_NEW
    , '_type': "ModelBase" };

  m.ModelBase.prototype.toJson = function() {
    return JSON.stringify(safeExtend({ }, this));
  };
    
  function defineModel(name, defaults) {
    var newModel = function() { };
    newModel.prototype = _.extend({ },
      m.ModelBase.prototype,
      defaults,
      { _type: name });

    return newModel;
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
    { 'isOk': function(result) { return result == '+OK'; }
    , 'asObj': function(json) { return JSON.parse(json); }
    , 'asJson': function(obj) { return JSON.stringify(obj); } };

  m.create = function(type, values) { 
    return safeExtend(new m[type](), values);
  };
  
  m.load = function(type, id) {
    var key = 'v:' + type + ':' + id;
    return jam.call(redis.get, key)(h.asJson);
  };

  m.save = function(obj) {
    var j = jam.id; 

    if (obj._id != ID_NEW) {
      j = j.return(obj);
    } else {
      j = j.call(redis.incr, 'v:' + obj._type + ':id')
        (function(newId) {
          obj._id = newId;
          this(obj);
        });
    }

    return j(function(obj) { 
      redis.set('v:' + obj._type + ':' + obj._id, obj, this);
    })(h.isOk);
  };

  // export the `m` object
  module.exports = m;

})();
