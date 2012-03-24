
// controller.js - Define the web's controller logic
// TOOD: Separate the routes?
(function() {

  var $E = module.exports = { }
    , platform = require('../platform/controller')
    , model = require('./model');

  with (platform) { // inject platform stuff into scope

    $E.Home = new Controller(function(ctr) {
      ctr.index = function(c) {
        return View('index', { title: 'My site', x: 4 });
      };
    });

    $E.Util = new Controller(function(ctr) {
      ctr.echoThis = function(c) { return Json(this); };
      ctr.echoRequest = function(c) { return Json(c.request); };
    });

    // TODO: Make json() polymorphic so it automatically resolve
    //   model relationship functions?
    $E.Users = new Controller(function(ctr) {
      // TODO: How to add a find_user function that executes before the actions?
      ctr.show = function(c) { return Json(c.user); };
      ctr.verses = function(c, callback) {
        c.user.verses.all(function(e, verses) {
          callback(e, Json(verses));
        });
      };
    });

    $E.Verses = new Controller(function(ctr) {
      ctr.show = function(c) { return Json(c.verse); };
      ctr.children = function(c, callback) {
        c.verse.children.all(function(e, verses) {
          callback(e, Json(verses));
        });
      };
    });

  } // with

})();
