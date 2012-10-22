var Stream = require('stream'),
    test = require('tap').test,
    BufferedStream = require('../').BufferedStream;

test('BufferedStream/multiple-streams', function (t) {
  var buffer = new BufferedStream(),
      streams = [new Stream(), new Stream()],
      got = [],
      i;

  t.plan(streams.length);

  for (i = 0; i < streams.length; i++) {
    (function (i) {
      got[i] = [];
      streams[i].writable = true;
      streams[i].write = function (chunk) {
        got[i].push(chunk);
      };
      streams[i].end = function () {
        t.deepEqual(got[i], ['hello', 'i know']);
      };
      buffer.pipe(streams[i]);
    })(i);
  }

  buffer.write('hello');
  buffer.write('i know');

  buffer.end();
});
