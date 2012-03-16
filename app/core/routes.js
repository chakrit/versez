
// routes.js - Define application routes
//   This simply maps controller to the express application
module.exports = function(app) {

  with (require('../../platform/routes')) {
    with (require('./controller')) {

      draw(app, function() {
        get('/', Home.index);

        scope('/util', Util, function(util) {
          get('/echo_this', util.echoThis);
          get('/echo_request', util.echoRequest);
        });

        scope('/users', Users, function(u) {
          get('/:id', u.show);
          get('/:id/verses', u.verses);
        });

        scope('/verses', Verses, function(v) {
          get('/:id', v.show);
          get('/:id/children', v.children);
        });

      });
    }
  }

};
