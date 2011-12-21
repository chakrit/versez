var express = require('express')
  , app = express.createServer()
  , stylus = require('stylus')
  ;

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

app.get('/', function(req, res){
  res.render('index', { title: 'My Site' });
});

var port = process.env.PORT || 1337;
console.log("Listening on " + port);
app.listen(port);