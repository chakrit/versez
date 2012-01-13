
// test.js - Test starter file
(function() {

  var assert = require('assert')
    , esc = require('./esc')
    , log = console.log; // TODO: Build a better log?

  // scan and build list of test modules available
  var tests = require('fs')
    .readdirSync(__dirname + '/tests/')
    .filter(function(test) { // filter .js files only
      return test.indexOf('.js', test.length - 3) !== -1;
    })
    .map(function(test) { // change to require syntax
      return test.substr(0, test.length - 3);
    });


  // test environment / support functions
  var count = { 'run': 0, 'pass': 0, 'fail': 0 };

  var createTestEnv = function() {
    var env = { };
    env.log = function(msg) { console.log(esc.silver + msg); } 
    env.fail = function(reason) { throw new Error(reason); };

    env.test = function(summary, code) {
      count.run++;

      try {
        log('Running  ' + summary);
        log(esc.lineUp);

        code();
        count.pass++;
        log(esc.green + 'OK       ' + esc.reset + summary);

      } catch (e) {
        count.fail++;
        log(esc.red + esc.bold + 'FAILED   ' + summary);
        log(esc.silver + '         ' + e.toString());
      }
    };

    env.testEval = function(code, summary) {
      env.test(summary || code, function() {
        with (env.testEval.scope)
          assert.ok(eval(code));
      });
    };

    // empty (user-modifiable) scope for eval
    env.testEval.scope = { };
    return env;
  };

  
  // extra assert helpers
  assert.not = function() {
    var args = Array.prototype.slice.apply(arguments);
    args[0] = !args[0];
    assert.ok.apply(assert, args);
  };

  assert.error = function(errName, func) {
    try { func(); }
    catch (e) {
      if ((e instanceof Error) &&
          (e.name === errName))
        return; // expected

      throw e; // not expected
    }
    
    assert.ok(false, errName + ' expected.');
  };


  // run the tests
  log(esc.cls);

  for (var i in tests) (function(i, test) {
    log(esc.cyan + esc.bold + '%s' + esc.reset, test);

    var env = createTestEnv()
      , testPath = './tests/' + test;
    
    try {
      // load test module
      var module = require(testPath);
      if (module.ignored) {
        log(esc.yellow + '(ignored)');
        return;
      }

      // run the test
      module.call({ }, env, assert);

    } catch (e) {
      log(esc.red + 'TEST MODULE ERROR: ' + e.toString());
    }
    
  })(i, tests[i]);

  // print summary
  log('');
  log(esc.cyan + esc.bold + 'Done.'
    + esc.silver + ' - ' + (new Date().toString()) + esc.reset);
  log(' [%d] ran', count.run);
  log(esc.green + ' [%d] pass', count.pass);
  log(esc.red + (count.fail > 0 ? esc.bold : '') + ' [%d] fail', count.fail);

  log(esc.reset);
  process.exit(count.fail);

})();
