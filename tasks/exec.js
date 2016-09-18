// grunt-exec
// ==========
// * GitHub: https://github.com/jharding/grunt-exec
// * Original Copyright (c) 2012 Jake Harding
// * Copyright (c) 2016 grunt-exec
// * Licensed under the MIT license.

module.exports = function(grunt) {
  var cp = require('child_process')
    , f = require('util').format
    , _ = grunt.util._
    , log = grunt.log
    , verbose = grunt.verbose;

  grunt.registerMultiTask('exec', 'Execute shell commands.', function() {

    var callbackErrors = false;

    var defaultCallback = function(err, stdout, stderr) {
      if (err) {
        callbackErrors = true;
        log.error('Error executing child process: ' + err.toString());
      }
    }

    var data = this.data
      , execOptions = data.options !== undefined ? data.options : {}
      , stdout = data.stdout !== undefined ? data.stdout : true
      , stderr = data.stderr !== undefined ? data.stderr : true
      , stdin = data.stdin !== undefined ? data.stdin : false
      , callback = _.isFunction(data.callback) ? data.callback : defaultCallback
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
      log.error('Missing command property.');
      return done(false);
    }

    if (data.cwd && _.isFunction(data.cwd)) {
      execOptions.cwd = data.cwd.apply(grunt, args);
    } else if (data.cwd) {
      execOptions.cwd = data.cwd;
    }

    data.maxBuffer && (execOptions.maxBuffer = data.maxBuffer);

    if (verbose) {
      verbose.writeln(f('Max stdout+stderr size is %d bytes', data.maxBuffer || (200*1024))); // 200*1024 is node's default
    }

    if (_.isFunction(command)) {
      command = command.apply(grunt, args);
    }

    if (!_.isString(command)) {
      log.error('Command property must be a string.');
      return done(false);
    }

    verbose.subhead(command);
    verbose.writeln(f('Expecting exit code %s', exitCodes.join(' or ')));

    childProcess = cp.exec(command, execOptions, callback.bind(grunt));

    stdout && childProcess.stdout.on('data', function (d) { log.write(d); });
    stderr && childProcess.stderr.on('data', function (d) { log.error(d); });

    // redirect stdin to childProcess
    if(stdin){
      process.stdin.on('readable', function() {
        var chunk = process.stdin.read();
        if (chunk !== null) {
          childProcess.stdin.write(chunk);
        }
      });
    }

    // Catches failing to execute the command at all (eg spawn ENOENT),
    // since in that case an 'exit' event will not be emitted.
    childProcess.on('error', function (err) {
      log.error(f('Failed with: %s', err));
      done(false);
    });

    childProcess.on('exit', function(code) {
      if (callbackErrors) {
        log.error("Node returned an error for this child process");
        return done(false);
      }

      if (exitCodes.indexOf(code) < 0) {
        log.error(f('Exited with code: %d.', code));
        return done(false);
      }

      verbose.ok(f('Exited with code: %d.', code));
      done();
    });
  });
};
