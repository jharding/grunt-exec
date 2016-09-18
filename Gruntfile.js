module.exports = function(grunt) {
  grunt.initConfig({
    exec: {
      remove_logs: {
        command: process.platform === 'win32' ? 'del *.log' : 'rm -f *.log'
      , stdout: false
      , stderr: false
      }
    , list_files: {
        cmd: process.platform === 'win32' ? 'dir' : 'ls -l **'
      }
    , list_all_files: process.platform === 'win32' ? 'dir' : 'ls -la'
    , echo_grunt_version: {
        cmd: function() { return 'echo ' + this.version; }
      }
    , print_name: {
        cmd: function(firstName, lastName) {
          var formattedName = [
                (lastName || 'grunt').toUpperCase()
              , (firstName || 'exec').toUpperCase()
              ].join(', ');

          return 'echo ' + formattedName;
        }
      }
    , test_mysql_ticket: {

      cmd: function () {
        var DB_USER = "abc";
        var DB_PASSWORD = "password";
        var DATABASE = "database-with-dashes";
        return `echo mysql -u "${DB_USER}" -p"${DB_PASSWORD}" -e "CREATE DATABASE IF NOT EXISTS \`${DATABASE}\`;"`;
      },
      callback: function(err, stdout, stderr) {
        console.log('stdout: ' + stdout);
        if ((stdout + "").trim() !== 'mysql -u "abc" -p"password" -e "CREATE DATABASE IF NOT EXISTS `database-with-dashes`;"') {
          grunt.log.error("Unexpected result: " + stdout);
          return false;
        }
      }
    }
    , test_large_stdout_buffer: {
      // maxBuffer has to be equal to count + 1
      options: { maxBuffer: 10000001, encoding: 'buffer' },
      
      stdout: false, // suppress the stdout otherwise you get a bunch of garbage being displayed
      
      cmd: function () {
        var count = 1000000;
        // generates count number of random bytes that are console-friendly (printable ascii 32->126)
        return `node -e "var garbage = ''; var count = ${count}; for (var i = 0; i < count; i++) { var c = String.fromCharCode(Math.floor(32 + (Math.random() * 94))); garbage += c; } process.stdout.write(garbage);"`;
      },
      callback: function(err, stdout, stderr) {
        var count = 1000000;

        if (err && err.toString() === "Error: stdout maxBuffer exceeded") {
          grunt.log.error("Unexpected maxBuffer exceeded");
          return false;
        }

        if (typeof stdout === "string") {
          grunt.log.error("Unexpected stdout type (string), expected buffer. String length was " + stdout.length);
          return false;
        }

        var str = stdout.toString();

        if (str.length !== count) {
          grunt.log.error("Unexpected result: " + str.length + " != " + count.toString());
          return false;
        }
      }
    }
    // this should produce an error
    , test_large_stdout_nocallback: {
      stdout: false, // suppress the stdout otherwise you get a bunch of garbage being displayed
      
      cmd: function () {
        var count = 1000000;
        // generates count number of random bytes that are console-friendly (printable ascii 32->126)
        return `node -e "var garbage = ''; var count = ${count}; for (var i = 0; i < count; i++) { var c = String.fromCharCode(Math.floor(32 + (Math.random() * 94))); garbage += c; } process.stdout.write(garbage);"`;
      },
    }
    , test_large_stdout_string: {
      // maxBuffer has to be equal to count + 1
      options: { maxBuffer: 10000001 },
      
      stdout: false, // suppress the stdout otherwise you get a bunch of garbage being displayed
      
      cmd: function () {
        var count = 1000000;
        // generates count number of random bytes that are console-friendly (printable ascii 32->126)
        return `node -e "var garbage = ''; var count = ${count}; for (var i = 0; i < count; i++) { var c = String.fromCharCode(Math.floor(32 + (Math.random() * 94))); garbage += c; } process.stdout.write(garbage);"`;
      },
      callback: function(err, stdout, stderr) {
        var count = 1000000;

        if (err && err.toString() === "Error: stdout maxBuffer exceeded") {
          grunt.log.error("Unexpected maxBuffer exceeded");
          return false;
        }

        if (typeof stdout !== "string") {
          grunt.log.error("Unexpected stdout type (" + (typeof stdout) + "), expected string.");
          return false;
        }

        if (stdout.length !== count) {
          grunt.log.error("Unexpected result: " + stdout.length + " != " + count.toString());
          return false;
        }
      }
    }
    , test_callback: {
        cmd : process.platform === 'win32' ? 'dir' : 'ls -h',
        callback : function(error, stdout, stderr){
          var cp = require('child_process');
          var util = require('util');
          console.log(util.inspect(cp));
          console.log('you can use callback, and error, stdout, stderr can be' +
           ' used as arguments.');
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
        }
      }
    }

  , jshint: {
      options: {
      // enforcing options
        curly: true
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
    , tasks: ['tasks/*.js']
    , tests: ['test/*.js']
    , gruntfile: ['Gruntfile.js']
    }
  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('lint', 'jshint');
};
