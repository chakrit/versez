
// routes.js - Routing platform function.
(function(undefined) {

  var _ = require('underscore')
    , $E = module.exports = { }
    , log = require('./log');

  // scopes stack
  var scopes = ['']
    , app = null;

  // begins drawing routes
  $E.draw = function(userApp, callback) {
    app = userApp;
    callback($E);
  };

  // enter new nested scope level
  $E.scope = function(url, values, callback) {
    if (url === undefined) return scopes.join(''); // getter overload
    if (callback === undefined) { // 2-arg overload
      callback = values;
      values = { }
    }

    scopes.push(url);
    callback(values);
    scopes.pop();
  };

  // map a route using current scope
  $E.map = function(url, methods, routeCallback) {
    if (methods === undefined) { // 2-arg overload
      routeCallback = methods;
      methods = ['get'];
    }
    if (typeof methods === 'string')
      methods = [methods];

    url = $E.scope() + url;

    // defer to express route mapper with our computed url scope
    methods = _.map(methods, function(m) { return m.toLowerCase(); });
    _.each(methods, function(m) {
      log('Route: ' + m.toUpperCase() + ' ' + url);
      app[m](url, routeCallback);
    });
  };

  // common http methods
  _(['get', 'post', 'put', 'delete']).each(function(method) {
    $E[method] = function(url, routeCallback) {
      $E.map(url, method, routeCallback);
    };
  });

})();
