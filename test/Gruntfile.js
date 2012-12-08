'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    exec: {
      test1: {
        cmd: 'echo "bruce willis was dead" > test1'
      }
    , test2: {
        cmd: function(grunt) {
          return 'echo "grunt@' + grunt.version + '" > test2';
        }
      }
    }
  });

  grunt.loadTasks('../tasks');
};
