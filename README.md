#nsh - A shell in node.js

This is `nsh`, the node.js shell project.  It is super-experimental, but
actually kind of works!

Please use with caution.

Also, this project was committed to git from inside of a running session of
itself.

Furthermore, I'm writing this readme from inside an `nsh` session! 

_SHELLCEPTION_

Current Features:

 - Execution via backticks and $()
 - Pipes
 - Arbitrary command execution (args must currently be in quotes)
 - Arbitrary JS execution

     console.log(`ifconfig -a`);
