
// esc.js - Console escape sequences
(function() {

  var esc =
    { 'lineUp': '2A'
    , 'cls': '2J'
    , 'reset': '0m'
    , 'unbold': '0m'
    , 'bold': '1m'
    , 'white': '0;0m'
    , 'silver': '0;37m'
    , 'gray': '0;30m'
    , 'yellow': '0;33m'
    , 'green': '0;32m'
    , 'red': '1;91m'
    , 'cyan': '0;36m'
    , 'bgRed': '41m' };

  // add esc char
  for (var i in esc) esc[i] = '\033[' + esc[i];

  module.exports = esc;

})();
