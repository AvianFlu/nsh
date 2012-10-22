var Stream = require('stream'),
    test = require('tap').test,
    BufferedStream = require('../').BufferedStream;

test('BufferedStream, writes before pipe, end before pipe', function (t) {
  var buffer = new BufferedStream(),
      stream = new Stream(),
      got = [];

  t.plan(1);

  stream.writable = true;

  stream.write = function (chunk) {
    got.push(chunk);
  };

  stream.end = function () {
    t.deepEqual(got, ['hello', 'i know']);
  };

  buffer.write('hello');
  buffer.write('i know');

  buffer.pipe(stream);

  buffer.end();
});

test('BufferedStream, mixed writes, end after all writes', function (t) {
  var buffer = new BufferedStream(),
      stream = new Stream(),
      got = [];

  t.plan(1);

  stream.writable = true;

  stream.write = function (chunk) {
    got.push(chunk);
  };

  stream.end = function () {
    t.deepEqual(got, ['hello', 'i know', 'nodejitsu']);
  };

  buffer.write('hello');
  buffer.write('i know');

  buffer.pipe(stream);

  process.nextTick(function () {
    buffer.write('nodejitsu');
    buffer.end();
  });
});
