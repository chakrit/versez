
// log.js - Logs utility functions
//   TODO: Add support for different logging envs
//         and/or stderr and stdin redirection?
module.exports = (function(_, e, undefined) {

  var s = '%s'; // param shortcut
  var formats =
    { 'h1': [e.cyan, e.bold, ,'______________________________\r\n', s]
    , 'h2': [e.white, e.bold, s]
    , 'subtitle': [e.silver, s]
    , 'warn': [e.yellow, s]
    , 'info': [e.silver, s]
    , 'error': [e.red, e.bold, s] };

  // turn formats into actual log functions
  for (var key in formats) formats[key] = (function(key, value) {

    // compose the actual log string
    value.push(e.reset); // always reset afterwards
    value = _.reduce(value, function(a, b) { return a + b; }, '');

    // calls console.log with the log string as first argument
    return function() {
      var args = Array.prototype.slice.apply(arguments);
      args.unshift(value);

      console.log.apply(console, args);
    };

  })(key, formats[key]);

  // export the revved-up log function
  return _.extend(console.log, formats);

})(require('underscore'), require('./esc'));

