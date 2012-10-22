#!/usr/bin/env node

var esprima = require('./vendor/esprima');
var spoon = require('spoon');
var escodegen = require('escodegen');

// Error.stackTraceLimit = 100;
function NSHELL() {
   // Error.stackTraceLimit = 100;
   var waitpid = require('node-waitpid')
   __$callback = function (err, val) {
      if (err) throw err;
      return val;
   }
   var Stream = require('stream').Stream;
   var BufferedStream = require('buffered').BufferedStream;
   JOBS = [];
   EXPORTS = {};
   function FilteringStream(fn, options) {
      Stream.call(this, options);
      this.fn = fn;
      this.piped = false;
      var self = this;
      this.on('pipe', function (s) {
         s.on('data', function (data) {
            self.write(data);
         })
         s.on('end', function () {
            self.end();
         })
      })
      return this;
   }
   FilteringStream.prototype = new Stream;
   FilteringStream.prototype.constructor = FilteringStream;
   FilteringStream.prototype.pipe = function (s, options) {
      Stream.prototype.pipe.call(this, s, options);
   }
   FilteringStream.prototype.write = function (d) {
      var val = this.fn(d) + '';
      this.emit('data', val);
   }
   FilteringStream.prototype.end = function () {
      this.emit('end');
   }
   var getOriginStream = function (origin) {
      if (origin.pipe
          || (origin.pid && origin.stdio)) {
         return getStreamable(origin);
      }
      var buff = new BufferedStream();
      buff.write(origin + '');
      return buff;
   }
   var getStreamable = function (origin) {
      if (origin.pipe) {
         return origin;
      }
      if (origin.pid && origin.stdio) {
         return origin;
      }
      if (typeof origin === 'function') {
         return new FilteringStream(origin);
      }
      var buff = new FilteringStream(function (d) {
         return d | origin;
      });
      return buff;
   }
   var getOutputStream = function (origin) {
      if (origin.pid) {
         return origin.stdio[1];
      }
      return origin;
   }
   var getInputStream = function (origin) {
      if (origin.pid) {
         return origin.stdio[0];
      }
      return origin;
   }
   $OR = function (origin, destination, next) {
      if (originStream && destinationStream) {
         origin.pipe(destination);
         next();
      }
      else {
         next( null, origin || destination );
      }
   }
   $ENV = function (k) {
      return process.env[k];
   }
   $PIPE = function () {
      var args = [].slice.call(arguments);
      var next = args.pop();
      // console.error('piping', arguments)
      var togo = 0;
      var done = false;
      function finish(e) {
         if (done) return;
         if (e) {
            done = true;
         }
         else {
            togo--;
            if (!togo) done = true;
         }
         next(e);
      }
      var arg = args.shift();
      var original = getOriginStream(arg);
      for (var i = 0; i < args.length;i++) {
         args[i] = getStreamable(args[i]);
      }
      for (var i = args.length - 1; i >= 0; i--) {
         args[i] = getInputStream(args[i]);
         if (i) getOutputStream(args[i - 1]).pipe(args[i]);
      }
      original.pipe(args[0]);
      return null;
   }
   $ = function (cmd, next) {
     cmd = cmd + '';
     var proc = require('child_process').spawn(process.env.SHELL || 'sh', ['-c', cmd]);
     var stdio = proc.stdio.map(function () {return ''});
     proc.stdio.forEach(function (pipe, i) {
         pipe.on('data', function (data) {
            stdio[i] += data+''
         })
      });
     JOBS.push(proc);
     proc.on('exit', function (code) {
       var index = JOBS.indexOf(proc);
       if (index !== -1) JOBS.splice(index, 1);
       if (code) {
         next(new Error('$(' + JSON.stringify(cmd).slice(1, -1) + ') exited with code: ' + code));
       }
       else {
         next(null, stdio[1]);
       }
     });
   }
   
     $CALL = function (cmd, args) {
         switch(cmd) {
            case "cd":
               process.cwd(args.length ? args[0] : process.env.HOME);
               break;
            default:
               var proc = require('child_process').spawn(process.env.SHELL || 'sh', ['-c', [cmd].concat(args || []).join(' ')], {
                  stdio: [
                     process.stdin, process.stdout, process.stderr
                  ]
               });
               waitpid(proc.pid);
         }
     }
   process.on('uncaughtException', function (e) {console.error(e.stack);})
}

var readline = require('readline');

var repl = readline.createInterface({
   input: process.stdin,
   output: process.stdout,
   terminal: true
});
var vm = require('vm');
var ctx = vm.createContext({
   process: process,
   require: require,
   console: console
});
vm.runInContext('(' + NSHELL.toString() + ')();', ctx);
repl.question('~ ', evaluate);
function evaluate(str) {
   var program = str; // should dump "0" to console
   var parsed = esprima.parse(program);
   var toSpoon = escodegen.generate(parsed);
   // console.error(toSpoon);
   vm.runInContext('(function () { ' + spoon(toSpoon, ['$', '$PIPE']) + '})()', ctx);
   repl.question('~ ', evaluate);
}
