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

    var p = cp.exec(data.command);
    p.stdout.on('data', function (d) {
      if (data.stdout) {
        log.write(d);
      }
    });
    var stderr = [];
    p.stderr.on('data', function (d) {
      if (data.stderr) {
        log.write(d);
      }
      stderr.push(d);
    });
    p.on('exit', function (code) {
      if (code >= 126) {
        grunt.warn('Exited with code: ' + code);
        done(false);
      } else if (stderr.length > 0) {
        // Should it really fail on stderr?
        grunt.warn(stderr.join(''));
        done(false);
      } else {
        verbose.write('Exited with code: ' + code);
        done();
      }
    });
    
  });

};
