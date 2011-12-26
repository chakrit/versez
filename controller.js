
// controller.js - Define the web's controller logic
(function() {

  // really just a simple function that expects
  // express server object, is all this is right now.
  function init(a) {
    a.get('/', function(req, resp) {
      resp.render('index', { title: 'My Site' });
    });
  }

  module.exports = { 'init': init }; 
  
})();
