
// model.defines.js - Define the actual model classes
(function() {

  var $E = module.exports = { }
    , define = require('./model');

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
    , 'authorId': -1
    , 'likes': 0
    , 'parentId': -1 });

  define.relation($E.User, 'author', $E.Verse, 'verses');
  define.relation($E.Verse, 'parent', $E.Verse, 'children');

})();
