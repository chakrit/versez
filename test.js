
// test.js - Test starter file
(function() {

  var _ = require('underscore')
    , fibers = require('fibers')
    , assert = require('assert')
    , jam = require('jam')
    , log = require('./log')
    , esc = require('./esc');

  // extra assert helpers
  assert.not = function() {
    var args = Array.prototype.slice.apply(arguments);
    args[0] = !args[0];
    assert.ok.apply(assert, args);
  };

  assert.error = function(errName, func) {
    // defaults to AssertionError which is probably the most common
    if (typeof errName === 'function' && func === undefined) {
      func = errName;
      errName = 'AssertionError';
    }

    try { func(); }
    catch (e) {
      if ((e instanceof Error) &&
          (e.name === errName))
        return; // expected

      throw e; // not expected
    }
    
    assert.ok(false, errName + ' expected.');
  };


  // scan and build list of test modules
  var modules = require('fs')
    .readdirSync(__dirname + '/tests/')
    .filter(function(module) { // filter .js files only
      return module.indexOf('.js', module.length - 3) !== -1;
    })
    .map(function(module) { // change to require-able path
      return module.substr(0, module.length - 3);
    });


  // test environment / support functions
  var createTestEnv = function(cb) {
    var env =
      { 'log': log
      , 'fail': function(reason) { throw new Error(reason); } };

    env.testAsync = function(summary, testFunc) {
      cb.start(summary);
      try {
	var callbackRan = false
	  , callbackTimeout = false;

	testFunc(function(e) {
	  if (callbackTimeout) return;
	  if (callbackRan) {
	    cb.hardFail('testAsync callback called more than once.');
	    return;
	  }
	  
	  callbackRan = true;
	  if (e) cb.fail(summary, e);
	  else cb.pass(summary);
	});

	setTimeout(function() {
	  if (callbackRan) return;

	  callbackTimeout = true;
	  var errStr = 'Test timed out (' +
	    env.testAsync.timeout + 'ms)';

	  cb.fail(summary, new Error(errStr));
	}, env.testAsync.timeout);
      }
      catch (e) { cb.fail(summary, e); }

      cb.wait(); // until .pass or .fail
    };

    env.testAsync.timeout = 2000;

    env.test = function(summary, testFunc) {
      env.testAsync(summary, function(next) {
	try { testFunc(); process.nextTick(next); }
	catch (e) { process.nextTick(function() { next(e); }); }
      });
    };

    env.testEval = function(evalStr, summary) {
      summary = summary || evalStr;

      env.test(summary, function() {
	with (env.testEval.scope)
	  assert.ok(eval(evalStr), summary);
      });
    };

    env.testEval.scope = { };
    return env;
  };
  

  // test status report callbacks / stats
  var count = { 'run': 0, 'pass': 0, 'fail': 0, 'skipped': 0 };

  var createTestCallbacks = function() {
    var hardFail = function(e) {
      log.error(e);
      process.exit(99999); // crash on hard fail
    };

    // callbacks are run in a Fiber to provide .wait() for async calls
    // this is to allow synchronous user-land test code while still
    // preserving order of test runs (and still have testAsync as well)
    var activeFiber = null;

    var wait = function() {
      if (activeFiber) return hardFail('.wait() with an active fiber!');
      activeFiber = Fiber.current;
      yield();
    };

    var resume = function() {
      if (!activeFiber) return hardFail('.resume() without an active fiber!');

      // remove activeFiber so checks pass before really resuming
      var fiber = activeFiber;
      activeFiber = null;
      fiber.run();
    };

    // test state callbacks
    var start = function(summary) {
      count.run++;
      log.testRunning(summary);
    };

    var pass = function(summary) {
      count.pass++;
      log(esc.lineUp);
      log.testPass(summary);
      if (activeFiber) resume();
    };

    var fail = function(summary, e) {
      count.fail++;
      log(esc.lineUp);
      log.testFail(summary, e);
      if (activeFiber) resume();
    };

    return(
      { 'start': start
      , 'pass': pass
      , 'fail': fail
      , 'wait': wait
      , 'resume': resume
      , 'hardFail': hardFail });
  };


  var summarizeAndExit = function() {
    log('');
    log.h1('Finished.');
    log('');
    log.subtitle(new Date());
    log.h2('results:');
    log.runReport(count.run);
    log.passReport(count.pass);
    if (count.fail > 0) log.failReport(count.fail);
    if (count.skipped > 0) log.skipReport(count.skipped);

    log('');
    process.exit(count.fail);
  };


  // run the tests
  log(esc.cls);

  var runModule = function(module, next) {
    log.h1(module);

    // attempt to load the test module
    var runner = null;
    try { runner = require('./tests/' + module); }
    catch (e) {
      log.error('Module error: ' + e);
      next(); // skip problematic module
      return;
    }

    // run tests on a fiber so the tests appear to run
    // synchronously even for testAsync calls.
    // Note that only one test are run at a time.
    var activeFiber = null;
    var env = createTestEnv(createTestCallbacks());

    Fiber(function() {
      var countBefore = count.run;
      runner(env, assert);
      
      if (count.run == countBefore)
        log.warn('(no tests were run)');

      // all tests should be made/completed by this point
      // thanks to Fiber, we can just place the next() call here safely
      next();
    }).run();
  };

  // actually *START* the test
  var spinTest = function() {
    if (modules.length) runModule(modules.shift(), spinTest);
    else summarizeAndExit();
  };

  process.nextTick(spinTest);

})();
