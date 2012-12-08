'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: ['Gruntfile.js', 'tasks/*.js', 'test/*.js']
    , options: {
      // enforcing options
        bitwise: true
      , camelcase: true
      , curly: true
      , forin: true
      , newcap: true
      , noarg: true
      , noempty: true
      , nonew: true
      , quotmark: true
      , undef: true
      , unused: true
      , trailing: true
      , maxlen: 80

      // relaxing options
      , boss: true
      , es5: true
      , expr: true
      , laxcomma: true

      // environments
      , node: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
};
