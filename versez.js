
// versez.js - Versez's main component namespace to simplify requires
(function() {

  module.exports =
    { 'model': require('./model')
    , 'config': require('./config')
    , 'controller': require('./controller')
    , 'util': require('./vutil') };

})();
