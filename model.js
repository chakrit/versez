
// model.js - Versez model definitions
(function() {

  var $E = module.exports = { }
    , define = require('./platform/model');

  // model definitions
  $E.User = define.model('User',
    { 'username': null
    , 'passwordHash': null
    , 'joinDate': null
    , 'lastLoginDate': null
    , 'twitterId': null });

  $E.Verse = define.model('Verse',
    { 'text': null
    , 'createDate': null
    , 'likes': 0 });

  define.relation($E.User, 'author', $E.Verse, 'verses');
  define.relation($E.Verse, 'parent', $E.Verse, 'children');

})();
