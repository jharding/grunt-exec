

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

var grunt = require('grunt');
var cp = require('child_process');

var _exec = cp.exec;
var stubs = {
  err: 'child process error',
  stdout: 'stdout',
  stderr: 'stderr'
};

grunt.loadTasks('tasks');

exports['grunt-exec'] = {
  tearDown: function(callback) {
    cp.exec = _exec;
    callback();
  },

  'no errors': function(test) {
    cp.exec = function(command, callback) {
      callback(null, stubs.stdout, null);
    };

    test.expect(2);
    grunt.helper('exec', 'ls', function(err, stdout) {
      test.equal(err, null);
      test.equal(stdout, stubs.stdout);
    });
    test.done();
  },

  'child_process exec throws error': function(test) {
    cp.exec = function(command, callback) {
      callback(stubs.err, stubs.stdout, null);
    };

    test.expect(2);
    grunt.helper('exec', 'ls', function(err, stdout) {
      test.equal(err, stubs.err);
      test.equal(stdout, stubs.stdout);
    });
    test.done();
  },

  'command errors out': function(test) {
    cp.exec = function(command, callback) {
      callback(null, stubs.stdout, stubs.err);
    };

    test.expect(2);
    grunt.helper('exec', 'ls', function(err, stdout) {
      test.equal(err, stubs.err);
      test.equal(stdout, stubs.stdout);
    });
    test.done();
  }
};
