
// platform/model.js - Versez platform layer for defining models
(function(undefined) {

  // TODO: Probably better to just throw away the concept of having n
  //   unsaved instance floating around, (i.e. all ModelBase instance
  //   are born saved with a proper ID). Should simplify lots of code.

  var _ = require('underscore')
    , config = require('../config')
    , log = require('./log');

  var $E = module.exports = { }
    , ID_NEW = $E['ID_NEW'] = -1
    , NS = 'v';

  // initialize redis client
  var redis = require('redis-url').connect(config.redis.url);
  redis.select(config.redis.db);

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

  // redis keys stitcher
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
      return (typeof objOrId === 'object') ?
        objOrId.saveIfNew(function() { inner(objOrId._id, callback); }) :
        inner(objOrId, callback); // objOrId is id
    };
  };

  // ensure we have a saved instance (aggresive save)
  var savedObjWrap = function(obj, inner) {
    return function() {
      var args = arguments
        , me = this;

      obj.saveIfNew(function() { inner.apply(me, args); });
    };
  };

  // __________________________________________________________________
  // general model layer functions
  $E.useTestDb = function() {
    return redis.select(config.redis.testDb, this);
  };

  // __________________________________________________________________
  // model definer
  $E.model = function(name, fields) {

    // ctors
    var model = function(values) {
      // check if we have an instance
      if (!(this instanceof model))
        return new model(values);

      cleanExtend(this, fields, values); // ensure hasOwnProperty()

      // run all registered initializers
      for (var i = 0; i < model._initializers.length; i++)
        model._initializers[i](this);
    };

    model._initializers = [];
    model._type = name;

    // prototype
    model.prototype = _.extend(new ModelBase(), cleanExtend({ }, fields),
      { '_id': ID_NEW
      , '_type': name });

    // class functions
    model.create = function(values) { return new model(values); };

    model.parse = function(json, id) {
      var obj = cleanExtend(new model(), JSON.parse(json));
      if (id !== undefined && (id = parseInt(id, 10)))
        obj._id = id;

      return obj
    };

    model.load = function(id, callback) {
      var key = stitch(name, id);

      redis.get(key, checkedWrap(function(json) {
        try { callback(null, model.parse(json, id)); }
        catch(e) { callback(e, null); }
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

      redis.set(stitch(name, me._id), me.toJson(), callback);
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
        , key = function() { return stitch(obj._type, obj._id, field); }
        , cache = null;

      // get target object (resolving ids and getting the real object)
      relation.get = function(callback) {
        if (cache) return _.defer(callback, null, cache);

        redis.get(key(), checkedWrap(function(id) {
          if (!id) return callback(null, cache = null);

          var destKey = stitch(toModel._type, id);

          redis.get(destKey, checkedWrap(function(json) {
            callback(null, cache = toModel.parse(json, id));
          }));
        }));
      };

      // set target object id
      // TODO: Make .set respect the cache? (possible inconsistency with .get() result)
      relation.set = objOrIdWrap(function(id, callback) {
        redis.set(key(), id, callback);
      });

      // ensure we're always dealing with saved objects when relations are accessed
      _(['set', 'get']).each(function(func) {
        relation[func] = savedObjWrap(obj, relation[func]);
      });

      return obj[field] = relation;
    });
  };

  $E.oneToMany = function(model, toModel, field) {
    model._initializers.push(function(obj) {
      var relation = new RelationBase()
        , key = function() { return stitch(obj._type, obj._id, field); }
        , cache = null;

      // fetch all instances in the relation
      // WARN: Probably very expensive for large collections
      relation.all = function(callback) {
        if (cache) return _.defer(callback, null, cache);

        // get list of IDs, then get all the JSONs and parse them into live objects
        redis.smembers(key(), checkedWrap(function(ids) {
          var keys = _.map(ids, _.bind(stitch, null, toModel._type));

          if (ids.length === 0)
            return callback(null, cache = []);

          redis.mget(keys, checkedWrap(function(jsons) {
            callback(null, cache = _.chain(jsons)
              .zip(ids)
              .map(_.bind(toModel.parse.apply, toModel.parse, toModel))
              .value());
          }));
        }));
      };

      // basic set functions (translate to redis set commands)
      // TODO: Make these functions respect the cache as well?
      //   otherwise we might have inconsistencies issue with .all()
      relation.add = function(id, callback) { redis.sadd(key(), id, callback); };
      relation.contains = function(id, callback) { redis.sismember(key(), id, callback); };
      relation.remove = function(id, callback) { redis.srem(key(), id, callback); };

      // ensure that these functions can be called with just an id
      _(['add', 'contains', 'remove']).each(function(func) {
        relation[func] = objOrIdWrap(relation[func]);
      });

      // ensure these functions are called after related objects are saved
      _(['all', 'add', 'contains', 'remove']).each(function(func) {
        relation[func] = savedObjWrap(obj, relation[func]);
      });

      return obj[field] = relation;
    });
  };

  // shortcuts for defining reverse reltaions
  $E.relation = function(parentModel, parentField, childModel, childField) {
    $E.oneToMany(parentModel, childModel, childField);
    $E.oneToOne(childModel, parentModel, parentField);
  };

})();
