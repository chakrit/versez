
// controller.js - Define the web's controller logic
// TOOD: Separate the routes?
(function() {

  var v = require('./versez')
    , m = v.model;

  function initResource(a, singularRes, pluralRes) {
    a.get('/' + pluralRes + '/:id', function(req, resp) {
      // TODO:
    });
  }

  function init(a) {
    a.get('/', function(req, resp) {
      resp.render('index', { title: 'My Site' });
    });

    initResource(a, 'user', 'users');
    initResource(a, 'verse', 'verses');
  }

  module.exports = { 'init': init }; 
  
})();
