module.exports = function(grunt) {
  grunt.initConfig({
    exec: {
      test1: {
        cmd: 'echo "bruce willis was dead" > test1'
      }
    , test2: {
        cmd: function() { return 'echo "grunt@' + this.version + '" > test2'; }
      }
    , test3: {
        cmd: function(answerToLife, tacoThoughts) {
          var text = [
            'the answer to life is ' + answerToLife
          , 'thoughts on tacos? ' + tacoThoughts
          ].join('\n');

          return 'echo "' + text + '" > test3';
        }
      }
    , test4: {
        cmd: function(){
          return 'echo "you can use callback, and error, stdout, stderr can be used as arguments"';
        },
        callback: function(error, stdout, stderr){
          var fs = require('fs');
          var path = require('path');
          var outputPath = path.resolve(process.cwd(), 'test4');
          console.log('outputPath : ' + outputPath);
          fs.writeFileSync(outputPath, stdout, 'utf-8');
        }
      }
    }
  });

  grunt.loadTasks('../tasks');
};
