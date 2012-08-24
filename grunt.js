module.exports = function(grunt) {
  grunt.initConfig({
    test: {
      files: ['test/**/*.js']
    },
    lint: {
      files: ['grunt.js', 'tasks/**/*.js', 'test/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'default'
    },
    jshint: {
      options: {
        // enforcing options
        bitwise: true,
        curly: true,
        newcap: true,
        noarg: true,
        noempty: true,
        nonew: true,
        trailing: true,

        // relaxing options
        boss: true,
        es5: true,
        evil: true,
        expr: true,

        // environments
        node: true
      }
    }
  });

  grunt.registerTask('default', 'lint test');
};
