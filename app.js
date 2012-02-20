var express = require('express')
  , stylus = require('stylus')
  , log = require('./platform/log')
  , esc = require('./platform/esc')
  , v = require('./versez')
  , app = express.createServer();

log(esc.cls + esc.cyan +
  "   _   _ ___________ _____ _____ ______\n" +
  "  | | | |  ___| ___ |  ___|  ___|___  /\n" +
  "  | | | | |__ | |_/ | `--.| |__    / / \n" +
  "  | | | |  __||    / `--. \\  __|  / /  \n" +
  "  \\ \\_/ / |___| |\\ \\/\\__/ / |___./ /___\n" +
  "   \\___/\\____/\\_| \\_\\____/\\____/\\_____/\n");

log('');
log.h1("VERSEZ - v" + v.config.version);
log(esc.silver);

// __________________________________________________________________
log("Configuring app...");

app.configure(function(){
  app.use(express.logger());
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(app.router);
  app.set('view engine', 'jade');

  app.use(stylus.middleware({
    src: __dirname + '/public',
    dest: __dirname + '/public',
    compile: function(str, path) {
      return stylus(str)
        .set('filename', path)
        .set('warn', true)
        .set('compress', true);
    }
  }));
});

app.configure('development', function(){
  app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  var oneYear = 31557600000;
  app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
  app.use(express.errorHandler());
});

// __________________________________________________________________
log("Initializing controllers...");
v.controller.init(app);

log("Starting up...");
var port = v.config.server.port || process.env.PORT || 80;
log("Listening on port " + port + "...");
app.listen(port);

