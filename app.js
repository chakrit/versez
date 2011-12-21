
var express = require('express')
  , app = express.createServer();

app.get('/', function(req, resp) {
  resp.send("Coming soon!");
});

var port = process.env.PORT || 1337;
console.log("Listening on " + port);
app.listen(port);

