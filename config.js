// config.js - Define app-wide configuration
(function() {

  var config =
    { 'version': '0.0.1'
    , 'redis':
      { 'url': process.env.REDISTOGO_URL || 'redis://0.0.0.0:6379'
      , 'db': 0
      , 'testDb': 1 }
    , 'server':
      { 'port': process.env.PORT || 1337
      , 'host': 'localhost' } };

  // TODO: Add environment specific setups here?
  module.exports = config;

})();
