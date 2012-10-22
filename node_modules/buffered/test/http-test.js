var http = require('http'),
    Stream = require('stream'),
    test = require('tap').test,
    BufferedStream = require('../').BufferedStream;

var PORT = 9000;

test('BufferedStream/http', function (t) {
  var buffer = new BufferedStream(),
      got = [],
      server;

  t.plan(2);

  server = http.createServer(function (req, res) {
    req.pipe(buffer);

    setTimeout(function () {
      buffer.pipe(res);
    }, 100);
  }).listen(PORT, function () {
    var req = http.request({ port: PORT, method: 'POST' }, function (res) {
      res.on('data', function (chunk) {
        got.push(chunk.toString());
      });

      res.on('end', function () {
        server.close();
        t.deepEqual(got, ['hello', 'i', 'know', 'nodejitsu']);
      });
    });

    req.write('hello');
    req.write('i');
    setTimeout(function () {
      req.write('know');
      setTimeout(function () {
        t.deepEqual(got, ['hello', 'i', 'know']);

        req.write('nodejitsu');
        req.end();
      }, 70);
    }, 50);
  });
});
