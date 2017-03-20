module.exports = function(grunt) {
  grunt.initConfig({
    exec: {
      test1: {
        cmd: 'echo bruce willis was dead> test1'
      }
    , test2: {
        cmd: function() { return 'echo grunt@' + this.version + '> test2'; }
      }
    , test3: {
        cmd: function(answerToLife, tacoThoughts) {
          var text = [
            'the answer to life is ' + answerToLife
          , 'thoughts on tacos? ' + tacoThoughts
          ].join(', ');

          return 'echo ' + text + '> test3';
        }
      }
    , test4: {
        cmd: function(){
          return 'echo you can use callback, and error, stdout, stderr can be' +
           ' used as arguments';
        }
      , callback: function(error, stdout, stderr){
          var fs = require('fs')
            , path = require('path')
            , outputPath = path.resolve(process.cwd(), 'test4');

          console.log('outputPath : ' + outputPath);
          console.log('stderr: ' + stderr);

          try {
            fs.writeFileSync(outputPath, stdout, 'utf-8');
          } catch (err) {
            console.error(err.stack);
          }
        }
      }
    , test5: {
        cmd: 'node -e "process.exit(8);"'
      , exitCodes: 8
      , shell: true
      }
    , test6: {
        cmd: 'node -e "process.exit(9);"'
      , exitCodes: [8, 9]
      , shell: true
      }
    , test7: 'echo you do not even need an object> test7'
    , test8: {
      cmd: 'node -e "console.log(\'synchronous echo 1\'); process.exit(0);"',
      sync: true,
      shell: true
    }
    , test9: {
      cmd: 'node -e "setTimeout(function () { console.log(\'synchronous echo 2, wait 3 seconds\'); process.exit(0); }, 3000);"',
      sync: true,
      shell: true
    }
    , test10: {
      cmd: 'node -e "console.log(\'synchronous echo 3\'); process.exit(0);"',
      sync: true,
      shell: true
    }
    }
  });

  grunt.loadTasks('../tasks');
};
