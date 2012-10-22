# buffered [![Build Status](https://secure.travis-ci.org/mmalecki/buffered.png)](http://travis-ci.org/mmalecki/buffered)
`buffered` stream is a implementation of a buffered stream, heavily based on
[@mikeal](https://github.com/mikeal)'s [`morestreams`](https://github.com/mikeal/morestreams).

## Installation

    npm install buffered

## Usage
```js
var fs = require('fs'),
    http = require('http'),
    BufferedStream = require('buffered').BufferedStream;

http.createServer(function (req, res) {
  var buffer = new BufferedStream();
  req.pipe(buffer);
  setTimeout(function () {
    buffer.pipe(fs.createWriteStream('req'));
  }, 500);
}).listen(8000);
```
