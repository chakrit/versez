
// model_basic.js - Basic model tests
var m = require('../model');

module.exports = function(e, a) {
  e.testEval.scope = { m: m };

  // _______________________________________________________
  e.log('ModelBase');

  e.test('ModelBase.toJson works', function() {
    var obj = new m.ModelBase();
    obj.a = 1;
    obj.b = 2;

    var result = JSON.parse(obj.toJson());
    a.ok('a' in result && result.a === obj.a);
    a.ok('b' in result && result.b === obj.b);
  });

  e.test('ModelBase.toJson skip Functions', function() {
    var obj = new m.ModelBase();
    obj.func = function() { };
    obj.x = 1;

    var result = JSON.parse(obj.toJson());
    a.not('func' in result);
    a.ok('x' in result && result.x === obj.x);
  });

  e.test('ModelBase.toJson skip privates', function() {
    var obj = new m.ModelBase();
    obj._x = 'private!';
    obj.x = 'not private!';

    var result = JSON.parse(obj.toJson());
    a.not('_x' in result);
    a.ok('x' in result && result.x === obj.x);
  });

  // _______________________________________________________
  e.log('constructors');

  e.testEval("m.create('User') instanceof m.User");
  e.testEval("m.create('User')._type === 'User'");
  e.testEval("m.create('Verse') instanceof m.Verse");
  e.testEval("m.create('Verse')._type === 'Verse'");
  e.testEval("m.create('User', { 'username': 'versez' }).username === 'versez'");
  e.testEval("m.create('User', { '_id': 'private!'})._id !== 'private!'");

};
