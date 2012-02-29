
// routes.js - Define application routes
//   This simply maps controller to the express application
module.exports = function(app) {

  // TODO: Use a routes platform function that provides better
  //   scoping functionality, e.g. url scope
  //   should also allow for printing out routes
  var scope = '/';
  var get = function(url, action) {
    console.log('Route: %s%s', scope, url);
    app.get(scope + url, action);
  };

  with (require('./controller')) {
    scope = '/';

    with (Util) {
      scope = '/util';
      get('/echo_this', echoThis);
      get('/echo_request', echoRequest);
    }

    with (Home) {
      scope = '/';
      get('', index);
    }

    with (Users) {
      scope = '/users';
      get('/:id', show);
      get('/:id/verses', verses);
    }

    with (Verses) {
      scope = '/verses';
      get('/:id', show);
      get('/:id/children', children);
    }
  }

};
