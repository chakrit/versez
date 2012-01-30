
// model.js - Test the model layer (and the platform model.js)
require('../platform/test')(module)(function(v, a, config) {

  var _ = require('underscore')
    , ID_NEW = require('../platform/model').ID_NEW
    , model = require('../model')
    , batch = { };

  // describe creation tests
  function describeModel(modelName, values) {
    var type = model[modelName];

    function assertValues(target) {
      for (var prop in values) {
	if (!values.hasOwnProperty(prop)) continue;

	a.equal(values[prop], target[prop]);
      }
    }

    return(
      { 'is created properly':
	{ topic: function() { return type; }
	, 'when invoked as function': function(type) { a.instanceOf(type(), type); }
	, 'when using .create()': function(type) { a.instanceOf(type.create(), type); }
	, 'when using new()': function(type) { a.instanceOf(new type(), type); }
	
	, 'with correct values':
	  { 'when invoked as function(values)': function(type) { assertValues(type(values)); }
	  , 'when using .create(values)': function(type) { assertValues(type.create(values)); }
	  , 'when using new(values)': function(type) { assertValues(new type(values)); } }
	
	, 'with id':
          { topic: function(type) { return new type()._id; } 
	  , 'a proper js number': function(id) { a.isNumber(id); }  
	  , 'equals to ID_NEW': function(id) { a.strictEqual(id, ID_NEW); } } }
      
      , 'instance':
        { topic: new type()
	, 'when saved successfully':
	  { topic: function(obj) { obj.save(this.callback); }
	  , 'calls back without error': function(e, result) { a.isNull(e); }
	  , 'calls back with OK message': function(e, result) { a.strictEqual(result, 'OK'); }

	  , 'is assigned':
	    { topic: function(e, result) { return this.context.topics[1]._id; }
	    , 'a numeric id': function(id) { a.isNumber(id); }
	    , 'an id that is *not* ID_NEW': function(id) { a.notStrictEqual(id, ID_NEW); } } } } });
  }

  v.describe('Models')
    .addBatch({ 'A User': describeModel('User', { 'username': 'versez' }) })
    .addBatch({ 'A Verse': describeModel('Verse', { 'text': 'lorem ipsum' }) });

  // TODO: Save/load tests, relation tests

});
