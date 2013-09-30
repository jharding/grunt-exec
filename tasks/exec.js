// grunt-exec
// ==========
// * GitHub: https://github.com/jharding/grunt-exec
// * Copyright (c) 2012 Jake Harding
// * Licensed under the MIT license.

module.exports = function(grunt) {
  var cp = require('child_process')
    , f = require('util').format
    , _ = grunt.util._
    , log = grunt.log
    , verbose = grunt.verbose;

  grunt.registerMultiTask('exec', 'Execute shell commands.', function() {
    var data = this.data
      , execOptions = {}
      , stdout = data.stdout !== undefined ? data.stdout : true
      , stderr = data.stderr !== undefined ? data.stderr : true
      , callback = _.isFunction(data.callback) ? data.callback : function() {}
      , onOutData = _.isFunction(data.onOutData) ? data.onOutData : function (d) { log.write(d); }
      , onErrData = _.isFunction(data.onErrData) ? data.onErrData : function (d) { log.write(d); }
      , exitCode = data.exitCode || 0
      , command
      , childProcess
      , args = [].slice.call(arguments, 0)
      , done = this.async();

    // allow for command to be specified in either
    // 'command' or 'cmd' property
    command = data.command || data.cmd;

    data.cwd && (execOptions.cwd = data.cwd);
    data.maxBuffer && (execOptions.maxBuffer = data.maxBuffer);

    if (!command) {
      log.error('Missing command property.');
      return done(false);
    }

    if (_.isFunction(command)) {
      command = command.apply(grunt, args);
    }

    if (!_.isString(command)) {
      log.error('Command property must be a string.');
      return done(false);
    }

    verbose.subhead(command);
    verbose.writeln(f('Expecting exit code %d', exitCode));

    childProcess = cp.exec(command, execOptions, callback);

    stdout && childProcess.stdout.on('data', onOutData);
    stderr && childProcess.stderr.on('data', onErrData);

    childProcess.on('exit', function(code) {
      if (code !== exitCode) {
        log.error(f('Exited with code: %d.', code));
        return done(false);
      }

      verbose.ok(f('Exited with code: %d.', code));
      done();
    });
  });
};
