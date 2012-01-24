
// model.js - Versez model layer entry point
(function(undefined) {

  var jam = require('jam')
    , _ = require('underscore')
    , config = require('./config');

  // initialize redis client
  var r = require('redis').createClient(config.redis.port, config.redis.host);
  r.select(config.redis.db);

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
    { 'isOk': function(result) { this(result); }
    , 'asObj': function(json) { this(JSON.parse(json)); }
    , 'asJson': function(obj) { this(JSON.stringify(obj)); } };

  m.switchToTestDb = function() {
    return jam(function() { r.select(config.redis.testDb, this); });
  };

  m.create = function(type, values) { 
    return safeExtend(new m[type](), values);
  };
  
  m.load = function(type, id) {
    var key = 'v:' + type + ':' + id;
    return jam.call(r.get, key)(h.asJson);
  };

  m.save = function(obj) {
    var j = null;

    if (obj._id != ID_NEW) {
      j = jam.return(obj);
    } else {
      j = jam(function() { r.incr('v:' + obj._type + ':id', this); })
        (function(newId) {
          obj._id = newId;
          this(obj);
        });
    }

    return j(function(obj) { 
      r.set('v:' + obj._type + ':' + obj._id, obj, this);
    });
  };

  // relationship functions
  m.User.prototype.getVerses = function() {
  };

  m.Verse.prototype.getAuthor = function() {
  };

  // export the `m` object
  module.exports = m;

})();
