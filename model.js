
// model.js - Versez model layer entry point
(function(undefined) {

  var _ = require('underscore')
    , config = require('./config')
    , log = require('./log');

  var $E = module.exports = { }
    , ID_NEW = -1
    , NS = 'v:';

  // initialize redis client
  var r = require('redis').createClient(config.redis.port, config.redis.host);
  r.select(config.redis.db);

  // types placeholder (no real use, just for type identification)
  var ModelBase = function() { }
    , ComponentBase = function() { };

  var RelationBase = function() { }
    , CounterBase = function() { };

  CounterBase.prototype = new ComponentBase();
  RelationBase.prototype = new ComponentBase();

  // __________________________________________________________________
  // utils
  var isPrivate = function(name) { return !!name.match(/^_.*$/); };

  // cleanly extends the destination (skipping private keys, relations and whatnot)
  var cleanExtend = function(dest, src) {
    if (arguments[2] !== undefined) { // support multiple src args
      return _.reduce(_.toArray(arguments), function(a, b) {
	return cleanExtend(a, b); // can't use directly because there's a 3rd arg
      }, dest);
    }

    for (var key in src) (function(key, value) {
      if (isPrivate(key)) return;
      if (value instanceof Function) return;
      if (value instanceof ComponentBase) return;
      if (value instanceof ModelBase) return;

      dest[key] = value;
    })(key, src[key]);

    return dest;
  };

  // redis keys sticher
  var stitch = function() {
    var len = arguments.length
      , str = NS;

    for (var i = 0; i < len; i++)
      str += ':' + arguments[i];

    return str;
  };

  // generate a standard node callback that automatically checks for errors
  // TODO: Good idea to absorb error here?
  var checkedWrap = function(inner) {
    return function(e, result) {
      return e ?
	log.error('Model error: ' + e.toString() + '\r\n' + e.stack) :
        inner(result);
    };
  };

  // checks if objOrId is an object or an id,
  // if it's an object, perform a saveIfNew to make sure we have an id
  // and then call the callback with the (old or new) id
  var objOrIdWrap = function(inner) {
    return function(objOrId, callback) {
      return (typeof objOrId !== 'string') ?
	objOrId.saveIfNew(function() { inner(objOrId._id, callback); }) :
	inner(objOrId, callback); // objOrId is id
    };
  };

  // __________________________________________________________________
  // general model layer functions
  $E.useTestDb = function() { 
    return r.select(config.redis.testDb, this);
  };

  // __________________________________________________________________
  // model definer
  $E.model = function(name, fields) {

    // ctors
    var model = function(values) {
      // run all registered initializers
      cleanExtend(this, fields, values); // ensure hasOwnProperty()

      for (var i = 0; i < model._initializers.count; i++)
        model._initializers[i](this);
    };

    model._initializers = [];
    model._type = name;

    // prototype
    model.prototoype = _.extend(new ModelBase(), cleanExtend({ }, fields),
      { '_id': ID_NEW
      , '_type': name });

    // class functions
    model.parse = function(json) {
      return cleanExtend(new model(), JSON.parse(json));
    };

    model.load = function(id, callback) {
      var key = stitch(name, id);

      redis.get(key, checkedWrap(function(json) {
	callback(model.parse(json));
      }));
    };

    // instance functions
    model.prototype.toClean = function() { return cleanExtend({ }, this); };
    model.prototype.toJson = function() { return JSON.stringify(this.toClean()); };
   
    model.prototype.save = function(callback) {
      var me = this;

      if (me._id === ID_NEW) {
	return redis.incr(stitch(name, '_id'), checkedWrap(function(newId) {
	  me._id = newId;
	  me.save(callback);
	}));
      }

      redis.set(stitch(name, me._id), callback);
    };

    model.prototype.saveIfNew = function(callback) {
      return (this._id === ID_NEW) ?
	this.save(callback) :
	_.defer(callback, null, true);
    };

    return model;
  };
 
  // __________________________________________________________________
  // relation definer
  $E.oneToOne = function(model, toModel, field) {
    model._initializers.push(function(obj) {
      var relation = new RelationBase()
        , key = stitch(obj._type, obj._id, name)
        , cache = null;

      // get target object (resolving ids and getting the real object)
      relation.get = function(callback) {
	if (cache) return _.defer(callback, null, cache);

	redis.get(key, checkedWrap(function(key_) {
	  redis.get(key_, checkedWrap(function(json) {
	    callback(null, cache = toModel.parse(json));
	  }));
	}));
      };

      // set target object id
      relation.set = objOrIdWrap(function(id, callback) {
	var destKey = stitch(toModel._type, id);
	redis.set(key, destKey, callback);
      });
      
      return obj[field] = relation;
    });
  };

  $E.oneToMany = function(model, toModel, field) {
    model._initializers.push(function(obj) {
      var relation = new RelationBase()
        , key = stitch(obj._type, obj._id, name)
        , cache = null;

      var idToKey = _.bind(stitch, null, toModel._type);

      // fetch all instances in the relation
      // WARN: Probably very expensive for large collections
      relation.all = function(callback) {
	if (cache) return _.defer(callback, null, cache);

	// get list of IDs, then get all the JSONs and parse them into live objects
	redis.smembers(key, checkedWrap(function(keys) {
	  redis.mget(keys, checkedWrap(function(jsons) {
	    callback(null, cache = _.map(jsons, toModel.parse));
	  }));
	}));
      };

      // push one instance to the list
      relation.add = objOrIdWrap(function(id, callback) {
	redis.sadd(key, idToKey(id), callback);
      });

      // checks if given instances is in the relation
      relation.contains = objOrIdWrap(function(id, callback) {
	redis.sismember(key, idToKey(id), callback);
      });

      // removes the given instance from the relation
      relation.remove = objOrIdWrap(function(id, callback) {
	redis.srem(key, idToKey(id), callback);
      });
    
      return obj[field] = relation;
    });
  };

  // shortcuts for defining reverse reltaions
  $E.relation = function(model, parentField, toModel, childrenField) {
    $E.oneToMany(model, toModel, childrenField);
    $E.oneToOne(toModel, model, parentField);
  };

})();
