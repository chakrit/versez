
// platform requires
var join = require('path').join
  , express = require('express')
  , stylus = require('stylus')
  , uglify = require('uglify-js-middleware')
  , log = require('./platform/log')
  , esc = require('./platform/esc')
  , app = express.createServer();

// versez app components
var v =
  { controller: require('./server/controller')
  , routes: require('./server/routes')
  , config: require('./config') };

// folders
var PUBLIC = 'public'
  , CLIENT = 'client'
  , VIEWS = 'views';

var D = function(folder) {
  return join(__dirname, folder);
};


// banner
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
log("Configuring server...");

app.configure(function() {

  // express core
  app.use(express.logger());
  app.use(express.methodOverride());
  app.use(express.bodyParser());

  // js/css processors
  app.use(stylus.middleware(
    { src: D(CLIENT)
    , dest: D(PUBLIC)
    , compile: function(str, path) {
        return stylus(str)
          .set('filename', path)
          .set('warn', true)
          .set('compress', true);
      }
    }));

  app.use(uglify(
    { src: D(CLIENT)
    , dest: D(PUBLIC)
    , uglyext: true }));

  // app core
  app.set('views', D(VIEWS));
  app.set('view engine', 'jade');
  app.use(app.router);

});

app.configure('development', function() {
  app.use(express.static(D(PUBLIC)));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  var oneYear = 31557600000;
  app.set('view cache', true);
  app.use(express.static(D(PUBLIC), { maxAge: oneYear }));
  app.use(express.errorHandler());
});

// __________________________________________________________________
log("Configuring routes...");
v.routes(app);

var port = v.config.server.port || process.env.PORT || 80;
log("Starting up...");
log("Listening on port " + port + "...");
app.listen(port);
