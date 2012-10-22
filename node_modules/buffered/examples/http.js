var fs = require('fs'),
    http = require('http'),
    BufferedStream = require('../').BufferedStream;

http.createServer(function (req, res) {
  var buffer = new BufferedStream();
  req.pipe(buffer);
  setTimeout(function () {
    buffer.pipe(fs.createWriteStream('req'));
    res.end();
  }, 500);
}).listen(8000);
