// grunt-exec
// ==========
// * GitHub: https://github.com/jharding/grunt-exec
// * Original Copyright (c) 2012 Jake Harding
// * Copyright (c) 2017 grunt-exec
// * Licensed under the MIT license.

// grunt-exe 2.0.0+ simulates the convenience of child_process.exec with the capabilities of child_process.spawn
// this was done primarily to preserve colored output from applications such as npm
// a lot of work was done to simulate the original behavior of both child_process.exec and grunt-exec
// as such there may be unintended consequences so the major revision was bumped
// a breaking change was made to the 'maxBuffer kill process' scenario so it is treated as an error and provides more detail (--verbose)
// stdout and stderr buffering & maxBuffer constraints are removed entirely where possible
// new features: detached (boolean), argv0 (override the executable name passed to the application), shell (boolean or string)
// fd #s greater than 2 not yet supported (ipc piping) which is spawn-specific and very rarely required
// TODO: support stdout and stderr Buffer objects passed in
// TODO: stdin/stdout/stderr string as file name => open the file and read/write from it

module.exports = function(grunt) {
  var cp = require('child_process')
    , f = require('util').format
    , _ = grunt.util._
    , log = grunt.log
    , verbose = grunt.verbose;

  grunt.registerMultiTask('exec', 'Execute shell commands.', function() {

    var callbackErrors = false;

    var defaultOut = log.write;
    var defaultError = log.error;

    var defaultCallback = function(err, stdout, stderr) {
      if (err) {
        callbackErrors = true;
        defaultError('Error executing child process: ' + err.toString());
      }
    };

    var data = this.data
      , execOptions = data.options !== undefined ? data.options : {}
      , stdout = data.stdout !== undefined ? data.stdout : true
      , stderr = data.stderr !== undefined ? data.stderr : true
      , stdin = data.stdin !== undefined ? data.stdin : false
      , stdio = data.stdio
      , callback = _.isFunction(data.callback) ? data.callback : defaultCallback
      , callbackArgs = data.callbackArgs !== undefined ? data.callbackArgs : []
      , sync = data.sync !== undefined ? data.sync : false
      , exitCodes = data.exitCode || data.exitCodes || 0
      , command
      , childProcess
      , args = [].slice.call(arguments, 0)
      , done = this.async();

    // https://github.com/jharding/grunt-exec/pull/30
    exitCodes = _.isArray(exitCodes) ? exitCodes : [exitCodes];

    // allow for command to be specified in either
    // 'command' or 'cmd' property, or as a string.
    command = data.command || data.cmd || (_.isString(data) && data);

    if (!command) {
      defaultError('Missing command property.');
      return done(false);
    }

    if (data.cwd && _.isFunction(data.cwd)) {
      execOptions.cwd = data.cwd.apply(grunt, args);
    } else if (data.cwd) {
      execOptions.cwd = data.cwd;
    }

    // default to current process cwd
    execOptions.cwd = execOptions.cwd || process.cwd();

    // manually supported (spawn vs exec)
    // 200*1024 is default maxBuffer of child_process.exec
    // NOTE: must be < require('buffer').kMaxLength or a RangeError will be triggered
    var maxBuffer = data.maxBuffer || execOptions.maxBuffer || (200*1024);

    // timeout manually supportted (spawn vs exec)
    execOptions.timeout = execOptions.timeout || data.timeout || 0;
    // kill signal manually supportted (spawn vs exec)
    execOptions.killSignal = execOptions.killSignal || data.killSignal || 'SIGTERM';

    // support shell scripts like 'npm.cmd' by default (spawn vs exec)
    var shell = (typeof data.shell === 'undefined') ? execOptions.shell : data.shell;
    execOptions.shell = (typeof shell === 'string') ? shell : (shell === false ? false : true);

    // kept in data.encoding in case it is set to 'buffer' for final callback
    data.encoding = data.encoding || execOptions.encoding || 'utf8';

    stdio = stdio || execOptions.stdio || undefined;
    if (stdio === 'inherit') {
      stdout = 'inherit';
      stderr = 'inherit';
      stdin = 'inherit';
    } else if (stdio === 'pipe') {
      stdout = 'pipe';
      stderr = 'pipe';
      stdin = 'pipe';
    } else if (stdio === 'ignore') {
      stdout = 'ignore';
      stderr = 'ignore';
      stdin = 'ignore';
    }

    if (_.isFunction(command)) {
      command = command.apply(grunt, args);
    }

    if (!_.isString(command)) {
      defaultError('Command property must be a string.');
      return done(false);
    }

    verbose.subhead(command);

    // manually parse args into array (spawn vs exec)
    var splitArgs = function(command) {
      // Regex Explanation                                          Regex
      // ---------------------------------------------------------------------
      // 0-* spaces                                                 \s*
      // followed by either:
      //   [NOT: a space, half quote, or double quote] 1-* times    [^\s'"]+
      //     followed by either:
      //       [half quote or double quote] in the future           (?=['"])
      //       or 1-* spaces                                        \s+
      //       or end of string                                     $
      //   or half quote                                            [']
      //     followed by 0-*:
      //       [NOT: a backslash, or half quote]                    [^\\']
      //       or a backslash followed by any character             \\.
      //     followed by a half quote                               [']
      //   or double quote                                          ["]
      //     followed by 0-*:
      //       [NOT: a backslash, or double quote]                  [^\\"]
      //       or a backslash followed by any character             \\.
      //     followed by a double quote                             ["]
      //   or end of string                                         $
      var pieces = command.match(/\s*([^\s'"]+(?:(?=['"])|\s+|$)|(?:(?:['](?:([^\\']|\\.)*)['])|(?:["](?:([^\\"]|\\.)*)["]))|$)/g);
      var args = [];
      var next = false;

      for (var i = 0; i < pieces.length; i++) {
        var piece = pieces[i];
        if (piece.length > 0) {
          if (next || args.length === 0 || piece.charAt(0) === ' ') {
            args.push(piece.trim());
          } else {
            var last = args.length - 1;
            args[last] = args[last] + piece.trim();
          }
          next = piece.endsWith(' ');
        }
      }

      // NodeJS on Windows does not have this issue
      if (process.platform !== 'win32') {
        args = [args.join(' ')];
      }

      return args;
    };

    var args = splitArgs(command);
    command = args[0];

    if (args.length > 1) {
      args = args.slice(1);
    } else {
      args = [];
    }

    // only save stdout and stderr if a custom callback is used
    var bufferedOutput = callback !== defaultCallback;

    // different stdio behavior (spawn vs exec)
    var stdioOption = function(value, integerValue, inheritValue) {
      return value === integerValue ? integerValue
        : value === 'inherit' ? inheritValue
        : bufferedOutput ? 'pipe' : value === 'pipe' || value === true || value === null || value === undefined ? 'pipe'
        : 'ignore'; /* value === false || value === 'ignore' */
    }

    execOptions.stdio = [
      stdioOption(stdin, 0, process.stdin),
      stdioOption(stdout, 1, process.stdout),
      stdioOption(stderr, 2, process.stderr)
      ];
    
    var encoding = data.encoding;
    var bufferedStdOut = bufferedOutput && execOptions.stdio[1] === 'pipe';
    var bufferedStdErr = bufferedOutput && execOptions.stdio[2] === 'pipe';
    var stdOutLength = 0;
    var stdErrLength = 0;
    var stdOutBuffers = [];
    var stdErrBuffers = [];

    if (bufferedOutput && !Buffer.isEncoding(encoding)) {
      if (encoding === 'buffer') {
        encoding = 'binary';
      } else {
        grunt.fail.fail('Encoding "' + encoding + '" is not a supported character encoding!');
        done(false);
      }
    }

    if (verbose) {
      stdioDescriptions = execOptions.stdio.slice();
      for (var i = 0; i < stdioDescriptions.length; i++) {
        stdioDescription = stdioDescriptions[i];
        if (stdioDescription === process.stdin) {
          stdioDescriptions[i] = 'process.stdin';
        } else if (stdioDescription === process.stdout) {
          stdioDescriptions[i] = 'process.stdout';
        } else if (stdioDescription === process.stderr) {
          stdioDescriptions[i] = 'process.stderr';
        }
      }

      verbose.writeln('buffer   : ' + (bufferedOutput ? 
        (bufferedStdOut ? 'stdout=enabled' : 'stdout=disabled')
        + ';' + 
        (bufferedStdErr ? 'stderr=enabled' : 'stderr=disabled') 
        + ';' + 
        'max size=' + maxBuffer
        : 'disabled'));
      verbose.writeln('timeout  : ' + (execOptions.timeout === 0 ? 'infinite' : '' + execOptions.timeout + 'ms'));
      verbose.writeln('killSig  : ' + execOptions.killSignal);
      verbose.writeln('shell    : ' + execOptions.shell);
      verbose.writeln('command  : ' + command);
      verbose.writeln('args     : [' + args.join(',') + ']');
      verbose.writeln('stdio    : [' + stdioDescriptions.join(',') + ']');
      verbose.writeln('cwd      : ' + execOptions.cwd);
      //verbose.writeln('env path : ' + process.env.PATH);
      verbose.writeln('exitcodes:', exitCodes.join(','));
    }

    if (sync)
    {
      childProcess = cp.spawnSync(command, args, execOptions);
    }
    else {
      childProcess = cp.spawn(command, args, execOptions);
    }

    if (verbose) {
      verbose.writeln('pid     : ' + childProcess.pid);
    }

    var killChild = function (reason) {
      defaultError(reason);
      process.kill(childProcess.pid, execOptions.killSignal);
      //childProcess.kill(execOptions.killSignal);
      done(false); // unlike exec, this will indicate an error - after all, it did kill the process
    };

    if (execOptions.timeout !== 0) {
      var timeoutProcess = function() {
        killChild('Timeout child process');
      };
      setInterval(timeoutProcess, execOptions.timeout);
    }

    var writeStdOutBuffer = function(d) {
      var b = !Buffer.isBuffer(d) ? new Buffer(d.toString(encoding)) : d;
      if (stdOutLength + b.length > maxBuffer) {
        if (verbose) {
          verbose.writeln("EXCEEDING MAX BUFFER: stdOut " + stdOutLength + " buffer " + b.length + " maxBuffer " + maxBuffer);
        }
        killChild("stdout maxBuffer exceeded");
      } else {
        stdOutLength += b.length;
        stdOutBuffers.push(b);
      }

      // default piping behavior
      if (stdout !== false && data.encoding !== 'buffer') {
        defaultOut(d);
      }
    };

    var writeStdErrBuffer = function(d) {
      var b = !Buffer.isBuffer(d) ? new Buffer(d.toString(encoding)) : d;
      if (stdErrLength + b.length > maxBuffer) {
        if (verbose) {
          verbose.writeln("EXCEEDING MAX BUFFER: stdErr " + stdErrLength + " buffer " + b.length + " maxBuffer " + maxBuffer);
        }
        killChild("stderr maxBuffer exceeded");
      } else {
        stdErrLength += b.length;
        stdErrBuffers.push(b);
      }

      // default piping behavior
      if (stderr !== false && data.encoding !== 'buffer') {
        defaultError(d);
      }
    };

    if (execOptions.stdio[1] === 'pipe') {
      var pipeOut = bufferedStdOut ? writeStdOutBuffer : defaultOut;
      // Asynchronous + Synchronous Support
      if (sync) { pipeOut(childProcess.stdout); }
      else { childProcess.stdout.on('data', function (d) { pipeOut(d); }); }
    }

    if (execOptions.stdio[2] === 'pipe') {
      var pipeErr = bufferedStdErr ? writeStdErrBuffer : defaultError;
      // Asynchronous + Synchronous Support
      if (sync) { pipeOut(childProcess.stderr); }
      else { childProcess.stderr.on('data', function (d) { pipeErr(d); }); }
    }

    // Catches failing to execute the command at all (eg spawn ENOENT),
    // since in that case an 'exit' event will not be emitted.
    // Asynchronous + Synchronous Support
    if (sync) {
      if (childProcess.error != null)
      {
        defaultError(f('Failed with: %s', error.message));
        done(false);
      }
    }
    else {
      childProcess.on('error', function (err) {
        defaultError(f('Failed with: %s', err));
        done(false);
      });  
    }

    // Exit Function (used for process exit callback / exit function)
    var exitFunc = function (code) {
      if (callbackErrors) {
        defaultError('Node returned an error for this child process');
        return done(false);
      }

      var stdOutBuffer = undefined;
      var stdErrBuffer = undefined;

      if (bufferedStdOut) {
        stdOutBuffer = new Buffer(stdOutLength);
        var offset = 0;
        for (var i = 0; i < stdOutBuffers.length; i++) {
          var buf = stdOutBuffers[i];
          buf.copy(stdOutBuffer, offset);
          offset += buf.length;
        }

        if (data.encoding !== 'buffer') {
          stdOutBuffer = stdOutBuffer.toString(encoding);
        }
      }

      if (bufferedStdErr) {
        stdErrBuffer = new Buffer(stdErrLength);
        var offset = 0;
        for (var i = 0; i < stdErrBuffers.length; i++) {
          var buf = stdErrBuffers[i];
          buf.copy(stdErrBuffer, offset);
          offset += buf.length;
        }

        if (data.encoding !== 'buffer') {
          stdErrBuffer = stdErrBuffer.toString(encoding);
        }
      }

      if (exitCodes.indexOf(code) < 0) {
        defaultError(f('Exited with code: %d.', code));
        if (callback) {
          var err = new Error(f('Process exited with code %d.', code));
          err.code = code;

          callback(err, stdOutBuffer, stdErrBuffer, callbackArgs);
        }
        return done(false);
      }

      verbose.ok(f('Exited with code: %d.', code));

      if (callback) {
        callback(null, stdOutBuffer, stdErrBuffer, callbackArgs);
      }

      done();
    }

    // Asynchronous + Synchronous Support
    if (sync) {
      exitFunc(childProcess.status);
    }
    else {
      childProcess.on('exit', exitFunc);      
    }
    
  });
};
