/*
 * grunt-exec
 * https://github.com/Jake/grunt-exec
 *
 * Copyright (c) 2012 Jake Harding
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  // Grunt utilities.
  var task = grunt.task;
  var file = grunt.file;
  var utils = grunt.utils;
  var log = grunt.log;
  var verbose = grunt.verbose;
  var fail = grunt.fail;
  var option = grunt.option;
  var config = grunt.config;
  var template = grunt.template;

  // external dependencies
  var exec = require('child_process').exec;

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('exec', 'Execute shell commands.', function() {
    var data = this.data;
   
    if (!data.command) {
      grunt.warn('Missing command property.');
      return false;
    }

    if (!utils._(data.command).isString()) {
      grunt.warn('The command property must be a string.');
      return false;
    }

    var done = this.async();

    verbose.subhead(data.command);
    grunt.helper('exec', data.command, data.stdout, data.stderr, function(err) {
      if (err) {
        grunt.warn(err);
        done(false);

        return;
      }

      done();    
    });
  });

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  grunt.registerHelper('exec', function(command, logStdout, logStderr, callback) {
    exec(command, function(err, stdout, stderr) {
      if (err) {
        callback(err);
        return;
      }
      if (logStdout) {
        log.write(stdout);
      }

      if (logStderr) {
        log.write(stderr);
      }

      callback();
    });
  });

};
