
// model.redis - Tests model with live redis connectivity
//   NOTE: Require a running redis instance.
module.exports = function(e, a) {


  return; // TODO:
  
  var m = require('../model')
    , _ = require('underscore')

  e.log("Switching to test db...");
  m.switchToTestDb();

  e.testAsync('User save/load', function(next) {
    var u = m.create('User',
      { 'username': 'chakrit'
      , 'passwordHash': '(empty)'
      , 'joinDate': new Date()
      , 'lastLoginDate': new Date()
      , 'twitterId': 'chakrit' });

    var u1 = _.extend({}, u);

    m.save(u)
      .do(function(ok) { a.ok(ok, 'Save failed.' + ok); })
      (next);
  });

};
