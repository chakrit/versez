
// model.js - Versez model layer entry point
(function() {

  var redis = require('redis')
    , jam = require('jam')
    , cfg = require('./config')
    , util = require('./util')
    , redisClient = redis.createClient(cfg.redis.port, cfg.redis.host);

  var m = { }
    , ID_NEW = -1;

  // base model definition template
  m.ModelBase = function() { };
  m.ModelBase.prototype =
    { '_id': ID_NEW
    , '_type': "ModelBase" };

  m.ModelBase.prototype.toJson = function() {
    var obj = {};
    for (var i in this) (function(i, value) {
      if (value instanceof Function ||
        value instanceof Array ||
        (i && i.match(/^_.+/)))
        return; // skip functions, arrays and private members

      obj[i] = value;
    })(i, this[i]);
  };
    
  function defineModel(name, defaults) {
    var newModel = function() { };
    util.extend(newModel.prototype = m.ModelBase, { '_type': name });
    util.extend(newModel.prototype, defaults);

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

  m.create = function(type) {
    return new m[type];
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
