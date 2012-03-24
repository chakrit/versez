
// model.js - Test the model layer (and the platform model.js)
require('../platform/test')(module, function(v, a, config) {

  var _ = require('underscore')
    , ID_NEW = require('../platform/model').ID_NEW
    , model = require('../app/core/model')
    , batch = { };

  // util for getting previous topics (which isn't quite available when doing async)
  function prev(this_) { return this_.context.topics[1]; }
  function twoPrev(this_) { return this_.context.topics[2]; }

  // model test macro
  function describeModel(modelName, values) {
    var type = model[modelName];

    // check that supplied model sample values are preserved
    function assertValues(target) {
      for (var prop in values) {
        if (!values.hasOwnProperty(prop)) continue;

        a.equal(values[prop], target[prop]);
      }
    }

    return(
      // ctor descriptions
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

      // save/load for single instance
      , 'instance':
        { topic: new type()
        , 'when saved successfully':
          { topic: function(obj) { obj.save(this.callback); }
          , 'calls back without error': function(e, result) { a.isNull(e); }
          , 'calls back with OK message': function(e, result) { a.strictEqual(result, 'OK'); }

          , 'is assigned':
            { topic: function(e, result) { return prev(this)._id; }
            , 'a numeric id': function(id) { a.isNumber(id); }
            , 'an id that is *not* ID_NEW': function(id) { a.notStrictEqual(id, ID_NEW); } } } }

      , 'instance with sample values':
        { topic: new type(values)
        , 'after roundtrip to redis':
          { topic: function(obj) {
              var cb = _.bind(this.callback, this);
              obj.save(function(e, result) { type.load(obj._id, cb); });
            }

          , 'should retains the values': function(obj) { assertValues(obj); }
          , 'should retains the id': function(obj) { a.strictEqual(obj._id, prev(this)._id); } } } });
  }

  // relation test macro
  function describeRelation(parentType, parentProp, childType, childProp) {

    // helper for creating object pair in the relation
    var pair = function() {
      var p = { 'parent': new parentType(), 'child': new childType() };

      p['parentChild'] = p.parent[childProp];
      p['childParent'] = p.child[parentProp];

      return p;
    };

    return (
      { 'instances':
        { topic: pair
        , 'have parent property in child': function(p) { a.include(p.child, parentProp); }
        , 'have child property in parent': function(p) { a.include(p.parent, childProp); }

        , 'when parent.child relation is accessed':
          { topic: function(p) { p.parentChild.all(this.callback); }
          , 'parent is automatically saved so it has an ID': function(e, result) { a.notStrictEqual(prev(this).parent._id, ID_NEW); } }

        , 'when child.parent relation is accessed':
          { topic: function(p) { p.childParent.get(this.callback); }
          , 'child is automatically saved so it has an ID': function(e, result) { a.notStrictEqual(prev(this).child._id, ID_NEW); } } }

      , 'when parent object':
        { topic: pair
        , 'is not yet set on child':
          { topic: function(p) { p.childParent.get(this.callback); }
          , 'calls back without error': function(e, result) { a.isNull(e); }
          , 'calls back with null': function(e, result) { a.isNull(result); } }

        , 'is set on child':
          { topic: function(p) { p.childParent.set(p.parent, this.callback); }
          , 'calls back without error': function(e, result) { a.isNull(e); }
          , 'calls back with OK': function(e, result) { a.strictEqual(result, 'OK'); }

          , 'getting back the instance':
            { topic: function(e, result) { prev(this).childParent.get(this.callback); }
            , 'calls back without error': function(e, obj) { a.isNull(e); }
            , 'calls back with non-null instance': function(e, obj) { a.isNotNull(obj); }
            , 'preserve instanceof checks': function(e, obj) { a.instanceOf(obj, parentType); }
            , 'have equal properties on toClean()': function(e, obj) { a.deepEqual(obj.toClean(), twoPrev(this).parent.toClean()); }
            , 'retains the same type': function(e, obj) { a.strictEqual(parentType._type, obj._type); }
            , 'retains the same ID': function(e, obj) { a.strictEqual(obj._id, twoPrev(this).parent._id); } } } }

      , 'when child property':
        { topic: pair
        , 'is not yet added to parent':
          { topic: pair
          , 'calling .contains(child)':
            { topic: function(p) { p.parentChild.contains(p.child, this.callback); }
            , 'calls back without error': function(e, result) { a.isNull(e); }
            , 'calls back with result ~= false': function(e, result) { a.equal(result, false); } } }

        , 'is added to parent':
          { topic: function(p) { p.parentChild.add(p.child, this.callback); }
          , 'calls back without error': function(e, result) { a.isNull(e); }
          , 'calls back with result ~= true': function(e, result) { a.equal(result, true); }

          , 'adding the same object again':
            { topic: function(e, result) { prev(this).parentChild.add(prev(this).child, this.callback); }
            , 'calls back without error': function(e, result) { a.isNull(e); }
            , 'calls back with result ~= false': function(e, result) { a.equal(result, false); } }

          , 'calling .contains(child)':
            { topic: function(e, result) { prev(this).parentChild.contains(prev(this).child, this.callback); }
            , 'calls back without error': function(e, result) { a.isNull(e); }
            , 'calls back with result ~= true': function(e, result) { a.equal(result, true); } }

          , 'and then removed':
            { topic: function(e, result) { prev(this).parentChild.remove(prev(this).child, this.callback); }
            , 'calls back without error': function(e, result) { a.isNull(e); }
            , 'calls back with result ~= true': function(e, result) { a.equal(result, true); } } } } });
  }

  // run the macro for all the types and relations
  v.describe('Models')
    .addBatch({ 'A User': describeModel('User', { 'username': 'versez' }) })
    .addBatch({ 'A Verse': describeModel('Verse', { 'text': 'lorem ipsum' }) });

  v.describe('Relations').addBatch(
    { 'User.verses & Verse.author': describeRelation(model.User, 'author', model.Verse, 'verses')
    , 'Verse.parent & Verse.children': describeRelation(model.Verse, 'parent', model.Verse, 'children') });

});
