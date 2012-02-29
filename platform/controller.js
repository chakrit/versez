
// controller.js - Controller platform
(function(undefined) {

  // TODO: Make controller async by default?

  var _ = require('underscore')
    , util = require('util')
    , $E = module.exports = { };

  // define possible result types
  $E.Result = function() {
    return function(ctx) {
      // TODO: Better log/reminder ?
      console.log("Can't render empty result!");
      ctx.response.send(404, { 'Content-Type': 'text/plain' }, '');
    };
  };

  $E.Json = function(obj) {
    var json = _.has(obj, 'toJson') ? obj.toJson() : obj.toString();
    return function(ctx) {
      ctx.response.send(200, { 'Content-Type': 'application/json' }, json);
    };
  };

  $E.View = function(name, data) {
    return function(ctx) {
      ctx.response.render(name, data);
    };
  };

  $E.Error = function(code, message) {
    code = code || 500;
    message = message || "Internal Server Error";

    return function(context) {
      context.response.send(code, { 'Content-Type': 'text/plain' }, message);
    };
  };

  // controller definition function
  $E.Controller = function(init) {
    // the init function should populate the controller prototype
    // with action methods which we'll then augment with stuff
    var ctr = { };
    init(ctr);

    // action context initializer
    var createContext = function(req, resp) {
      var ctx = { request: req, response: resp };
      return _.extend(ctx, req.params);
    };

    // wrap actions so a new context is created for each invocation
    // and set to `this` so variables and helpers are immediately accessible
    var wrapAction = function(action) {
      return function(req, resp) {
        var context = createContext(req, resp);

        var callback = function(e, result) {
          if (e) result = $E.Error(500, e.toString());
          result(context);
        };

        var result = action(context, callback);
        if (result === undefined || result === null) {
          // no result returned, wait for callback to be invoked
          // TODO: Timeout?
        } else {
          process.nextTick(function() {
            callback(null, result);
          });
        }
      };
    };

    // augment any defined actions and plug it into the controller
    for (var action in ctr) {
      this[action] = wrapAction(ctr[action]);
    };

    return this;
  };

})();
