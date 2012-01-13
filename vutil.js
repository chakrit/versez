
// vutil.js - Site-wide utility functions
//   needs the 'v' prefix since node already have a 'util' module
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

  // TODO: Replace with backbone's extend?
  //   This is used in modelx.js file
  function extend(obj, props) {
    for (var x in props)
      obj[x] = props[x];

    return obj;
  }

  // wire module exports
  exports = ['modifyCopy', 'extend'];
  module.exports = {};
  for (var i in exports)
    module.exports[exports[i]] = eval(exports[i]);

})();
