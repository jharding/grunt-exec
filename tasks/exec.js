// grunt-exec
// ==========
// * GitHub: https://github.com/jharding/grunt-exec
// * Copyright (c) 2012 Jake Harding
// * Licensed under the MIT license.

module.exports = function(grunt) {
  // grunt utilities
  // ---------------

  var task = grunt.task;
  var file = grunt.file;
  var util = grunt.util;
  var log = grunt.log;
  var verbose = grunt.verbose;
  var fail = grunt.fail;
  var option = grunt.option;
  var config = grunt.config;
  var template = grunt.template;

  // dependencies
  // ------------

  var cp = require('child_process');

  // task
  // ----

  grunt.registerMultiTask('exec', 'Execute shell commands.', function() {
    var data = this.data;

    if (!data.command) {
      grunt.warn('Missing command property.');
      return false;
    }

    if (util._.isFunction(data.command)) {
        data.command = data.command(grunt);
    }

    if (!util._(data.command).isString()) {
      grunt.warn('The command property must be a string.');
      return false;
    }

    var done = this.async();

    verbose.subhead(data.command);
    cp.exec(data.command, function(err, stdout) {
      // if configured, log stdout
      data.stdout && stdout && log.write(stdout);

      if (err) { grunt.warn(err); done(false); return; }

      done();
    });
  });

  // helper
  // ------

  function execTask(command, callback) {
    cp.exec(command, function(err, stdout, stderr) {
      if (err || stderr) { callback(err || stderr, stdout); return; }

      callback(null, stdout);
    });
  };
};

