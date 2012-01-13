// config.js - Define app-wide configuration
(function() {

  var config =
    { 'version': '0.0.1'
    , 'redis':
      { 'host': '127.0.0.1'
      , 'port': 6379 }
    , 'server':
      { 'port': process.env.PORT || 1337 
      , 'host': 'localhost' } };

  // TODO: Add environment specific setups here?
  module.exports = config;

})();
