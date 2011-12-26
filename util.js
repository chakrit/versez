
// util.js - Site-wide utility functions
(function() {

  // Returns a copy of the `obj` modified with stuff in `props`
  function modifyCopy(obj, props) {
    var copy = {};
    for (var x in obj) {
      if (typeof obj[x] === 'object') {
        copy[x] = modifyCopy(obj[x], props[x]);
      } else {
        copy[x] = (x in props) ? props[x] : obj[x];
      }
    }

    return copy;
  };

  // wire module exports
  exports = ['modifyCopy'];
  module.exports = {};
  for (var i in exports)
    module.exports[exports[i]] = eval(exports[i]);

})();
