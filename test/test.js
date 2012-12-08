'use strict';

var grunt = require('grunt')
  , path = require('path')
  , fs = require('fs')
  , assert = require('assert')
  , testDir = path.join(process.cwd(), 'test')
  , opts = { gruntfile: path.join(testDir, 'Gruntfile.js') };

grunt.tasks('exec', opts, function() {
  var test1OutputPath = path.join(testDir, 'test1')
    , test2OutputPath = path.join(testDir, 'test2')
    , test1Expected = 'bruce willis was dead\n'
    , test2Expected = 'grunt@' + grunt.version + '\n';

  assert.equal(fs.readFileSync(test1OutputPath, 'utf8'), test1Expected);
  assert.equal(fs.readFileSync(test2OutputPath, 'utf8'), test2Expected);

  // clean up
  fs.unlinkSync(test1OutputPath);
  fs.unlinkSync(test2OutputPath);

  grunt.log.ok('test passed');
});
