var express = require('express')
  , stylus = require('stylus')
  , app = express.createServer()
  , v = require('./versez')
  ;

console.log("\n\n\n\n");
console.log("VERSEZ - v" + v.config.version);
console.log("---------------");

// __________________________________________________________________
console.log("Configuring app...");

app.configure(function(){
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
console.log("Initializing controllers...");

v.controller.init(app);


// __________________________________________________________________
console.log("Starting up...");

var port = v.config.server.port || process.env.PORT || 80;
console.log("Listening on port " + port);
app.listen(port);

