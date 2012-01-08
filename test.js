
// test.js - Test starter file
(function() {

  // define list of tests (TODO: Scan the test folder and load all tests?)
  var tests =
    [ 'model_basic'
    , 'app_basic'
    , 'test_basic' ];

  var assert = require('assert')
    , child_process = require('child_process')
    , util = require('util')
    , util_ = require('./util')
    , log = console.log; // TODO: Build a better log?

  // test environment / support functions
  var env =
    { 'log': log 
    , 'fail': function(reason) { throw { 'reason': reason }; } };

  // stats
  var count = { 'run': 0, 'pass': 0, 'fail': 0 };

  // console escape codes
  var esc =
    { 'lineUp': '\033[2A'
    , 'reset': '\033[0;37m'
    , 'unbold': '\033[0m'
    , 'bold': '\033[1m'
    , 'white': '\033[0;37m'
    , 'green': '\033[0;32m'
    , 'red': '\033[0;31m'
    , 'cyan': '\033[0;36m' };

  // run the tests // TODO: Run asynchronously/in clean environment?
  for (var i in tests) (function(test) {
    var testEnv = util_.extend({ }, env);

    // main test definition function
    testEnv.test = function(summary, code) {
      count.run++;
      
      try {
        log('Running  ' + summary);
        log(esc.lineUp);

        code();
        count.pass++;
        log(esc.green + 'OK       ' + esc.reset + summary);

      } catch (e) {
        count.fail++;
        log(esc.red + esc.bold + 'FAILED   ' + esc.reset + summary);
        log(e);
      }
    };

    // run the test module with fresh env
    test = './tests/' + test;

    log('');
    log(esc.cyan + '%s', test);
    log(esc.reset + '--------------------');
    require(test).call({ }, testEnv, assert);
  
  })(tests[i]);

  log('');
  log(esc.cyan + 'Done.' + esc.reset);
  log(esc.reset + '--------------------');
  log(' [%d] ran', count.run);
  log(esc.green + ' [%d] pass', count.pass);
  log(esc.red + (count.fail > 0 ? esc.bold : '') + ' [%d] fail', count.fail);

  log(esc.reset);
  process.exit(count.fail);

})();
