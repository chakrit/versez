
// test_forever.js - A script to repeatedly run tests
//   so we can better do iterative development.
(function() {

  var RUN_DELAY = 500; // prevent too fast triggers

  var fs = require('fs')
    , util = require('util')
    , exec = require('child_process').exec
    , esc = require('./esc');

  // define generic file watcher
  var FileWatch = function(filename) {
    var me = this
      , started = false;

    console.log("Watching: " + filename);

    me.start = function(listener) {
      if (started) return;

      started = true;
      fs.watchFile(filename, function(cur, prev) {
        if (cur.mtime == prev.mtime) return;
        listener(filename);
      });
    };

    this.stop = function() {
      if (!started) return;

      fs.unwatchFile(filename);
      started = false;
    };
  };
  

  // watch loop
  var files = fs
    .readdirSync('./tests/')
    .map(function(file) { return './tests/' + file; });
  
  files.push.apply(files, fs.readdirSync('./'));

  var watches = files
    .filter(function(file) { // filter .js files only
      return file.indexOf('.js', file.length - 3) !== -1;
    })
    .map(function(file) { return new FileWatch(file); });

  // actual watch/trigger loop
  var runTimer = { };

  function watch() {
    console.log("Watching files...");
    watches.forEach(function(fw) { fw.start(trigger); });
  }

  function trigger(filename) {
    console.log("File changed: %s", filename);
    watches.forEach(function(fw) { fw.stop(); });

    if (runTimer) clearTimeout(runTimer);
    runTimer = setTimeout(runOnce, RUN_DELAY);
  }

  function runOnce() {
    console.log("Running test.js ...");

    runTimer = null;
    exec('node test.js', function(err, stdout, stderr) {
      process.stdout.write(stdout);
      watch(); // restart watch
    });
  }

  watch();

})();
