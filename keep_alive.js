var http = require('http');

http
  .createServer(function (req, res) {
    res.write("Running !!");
    res.end();
  })
  .listen(8080);