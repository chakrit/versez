
// esc.js - Console escape sequences
(function() {

  var esc =
    { 'lineUp': '2A'
    , 'cls': '2J'
    , 'reset': '0;37m'
    , 'unbold': '0m'
    , 'bold': '1m'
    , 'white': '0;37m'
    , 'green': '0;32m'
    , 'red': '0;31m'
    , 'cyan': '0;36m' };

  // add esc char
  for (var i in esc) esc[i] = '\033[' + esc[i];

  module.exports = esc;

})();
